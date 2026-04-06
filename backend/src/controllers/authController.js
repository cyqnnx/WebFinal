import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import User from '../models/userModel.js';
import Cart from '../models/cartModel.js';
import CartItem from '../models/cartItemModel.js';

const jwtSecret = process.env.JWT_SECRET;
const tokenExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    jwtSecret,
    { expiresIn: tokenExpiresIn },
  );
}

function normalizeGuestId(req) {
  // Prefer cookie (if you later add httpOnly guestId cookie), but support request body too.
  return req.cookies?.guestId || req.body?.guestId || null;
}

async function mergeGuestCartIntoUser({ userId, guestId }) {
  if (!guestId) return;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const guestCart = await Cart.findOne({ guestId }).populate('items').session(session);
    if (!guestCart) {
      await session.commitTransaction();
      return;
    }

    const userCart =
      (await Cart.findOne({ userId }).session(session)) ||
      (await Cart.create([{ userId, items: [] }], { session })).at(0);

    const guestItems = guestCart.items || [];
    if (guestItems.length === 0) {
      await Cart.deleteOne({ _id: guestCart._id }).session(session);
      await session.commitTransaction();
      return;
    }

    const guestByDrink = new Map(); // drinkId(string) -> quantity(number)
    for (const item of guestItems) {
      const key = item.drinkId.toString();
      guestByDrink.set(key, (guestByDrink.get(key) || 0) + item.quantity);
    }

    const drinkIds = [...guestByDrink.keys()].map((id) => new mongoose.Types.ObjectId(id));
    const existingUserItems = await CartItem.find({
      cartId: userCart._id,
      drinkId: { $in: drinkIds },
    }).session(session);

    const userItemsByDrink = new Map(
      existingUserItems.map((doc) => [doc.drinkId.toString(), doc]),
    );

    const newItems = [];
    for (const [drinkIdStr, quantityToAdd] of guestByDrink.entries()) {
      const existing = userItemsByDrink.get(drinkIdStr);
      if (existing) {
        existing.quantity += quantityToAdd;
        await existing.save({ session });
      } else {
        const doc = await CartItem.create(
          [{ cartId: userCart._id, drinkId: drinkIdStr, quantity: quantityToAdd }],
          { session },
        );
        newItems.push(doc[0]);
      }
    }

    // Add new items to user cart.
    if (newItems.length > 0) {
      userCart.items.push(...newItems.map((d) => d._id));
      await userCart.save({ session });
    }

    // Delete guest cart items + the guest cart record.
    const guestItemIds = guestItems.map((i) => i._id);
    await CartItem.deleteMany({ _id: { $in: guestItemIds } }).session(session);
    await Cart.deleteOne({ _id: guestCart._id }).session(session);

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function signup(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const guestId = normalizeGuestId(req);

    if (!email || !password) {
      return res.status(400).json({ error: { message: 'email and password are required' } });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: { message: 'User already exists' } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    await mergeGuestCartIntoUser({ userId: user._id, guestId });

    return res.status(201).json({
      token: signToken(user),
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const guestId = normalizeGuestId(req);

    if (!email || !password) {
      return res.status(400).json({ error: { message: 'email and password are required' } });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: { message: 'Invalid credentials' } });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: { message: 'Invalid credentials' } });

    await mergeGuestCartIntoUser({ userId: user._id, guestId });

    return res.status(200).json({
      token: signToken(user),
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
}

export async function me(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

    const user = await User.findById(userId).select('email role');
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    return res.status(200).json({ user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    return next(err);
  }
}

