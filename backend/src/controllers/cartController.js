import Cart from '../models/cartModel.js';
import CartItem from '../models/cartItemModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { getAssetUrl } from '../config/storageUtils.js';

function getCartIdentity(req) {
  // If the user is authenticated and logged in, use their MongoDB userId
  let userId = null;
  if (req.user && req.user.id) {
    userId = req.user.id;
  }

  if (userId) {
    return { userId: userId };
  }

  // If the user is NOT logged in, try to find a guestId string
  let guestId = null;
  if (req.cookies && req.cookies.guestId) {
    guestId = req.cookies.guestId;
  } else if (req.body && req.body.guestId) {
    guestId = req.body.guestId;
  } else if (req.query && req.query.guestId) {
    guestId = req.query.guestId;
  }

  // Return the guestId object, or explicitly null if one was never provided
  if (guestId) {
    return { guestId: guestId };
  } else {
    return { guestId: null };
  }
}

async function getOrCreateCart({ userId, guestId }) {
  const filter = userId ? { userId } : { guestId };
  const cart = await Cart.findOne(filter).populate('items');
  if (cart) return cart;

  return Cart.create({ ...filter, items: [] });
}

async function buildCartResponse(identity) {
  const cart = await getOrCreateCart(identity);

  // Populate products for display.
  const cartWithProducts = await Cart.findById(cart._id).populate({
    path: 'items',
    populate: { path: 'drinkId', model: 'Product' },
  });

  const items = await Promise.all(
    (cartWithProducts.items || []).map(async (cartItem) => {
      const product = cartItem.drinkId;
      
      // If the product was deleted from the database, it will resolve to null. Skip it.
      if (!product) {
        return null;
      }
      
      // Resolve the main thumbnail URL from the storage bucket
      const fetchedThumbnailUrl = await getAssetUrl(product.thumbnail);
      
      // Resolve all auxiliary description images
      const fetchedDescriptionImageUrls = await Promise.all(
        (product.descriptionImages || []).map((imageKey) => {
          return getAssetUrl(imageKey);
        })
      );
      
      return {
        id: cartItem._id,
        cartId: cartItem.cartId,
        drinkId: product._id,
        quantity: cartItem.quantity,
        name: product.name,
        price: product.price,
        discountPercent: product.discountPercent,
        thumbnailUrl: fetchedThumbnailUrl,
        descriptionImageUrls: fetchedDescriptionImageUrls,
      };
    }),
  );

  let userContext = {};
  if (identity.userId) {
    const user = await User.findById(identity.userId);
    if (user) {
      userContext.address = user.address || '';
      userContext.phone = user.phone || '';
    }
  }

  // Filter out any cart items that mapped to null because their product was missing
  const validItems = items.filter(item => item !== null);

  return { cartId: cartWithProducts._id, items: validItems, ...userContext };
}

export async function getCart(req, res, next) {
  try {
    const identity = getCartIdentity(req);
    if (!identity.userId && !identity.guestId) {
      return res.status(400).json({ error: { message: 'guestId is required for guest cart' } });
    }

    return res.status(200).json(await buildCartResponse(identity));
  } catch (err) {
    return next(err);
  }
}

export async function addCartItem(req, res, next) {
  try {
    const identity = getCartIdentity(req);
    if (!identity.userId && !identity.guestId) {
      return res.status(400).json({ error: { message: 'guestId is required for guest cart' } });
    }

    const { drinkId, quantity } = req.body || {};
    const qty = Number(quantity);
    if (!drinkId || !Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ error: { message: 'drinkId and quantity (>= 1) are required' } });
    }

    const cart = await getOrCreateCart(identity);

    const existing = await CartItem.findOne({ cartId: cart._id, drinkId });
    if (existing) {
      existing.quantity += qty;
      await existing.save();
    } else {
      const created = await CartItem.create({ cartId: cart._id, drinkId, quantity: qty });
      cart.items.push(created._id);
      await cart.save();
    }

    return res.status(200).json(await buildCartResponse(identity));
  } catch (err) {
    return next(err);
  }
}

