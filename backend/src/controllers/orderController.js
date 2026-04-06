import Cart from '../models/cartModel.js';
import CartItem from '../models/cartItemModel.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';

async function getUserCartWithProducts(userId) {
  const cart = await Cart.findOne({ userId }).populate({
    path: 'items',
    populate: { path: 'drinkId', model: 'Product' },
  });
  return cart;
}

export async function listOrders(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (err) {
    return next(err);
  }
}

export async function createOrder(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

    const { address, phone, notes } = req.body;
    if (!address || !phone) {
      return res.status(400).json({ error: { message: 'Address and phone are required' } });
    }

    const cart = await getUserCartWithProducts(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: { message: 'Cart is empty' } });
    }

    // Create one independent order record for every unique item in the user's cart
    const createdOrders = [];
    
    for (const cartItem of cart.items) {
      const product = cartItem.drinkId;
      
      // Skip processing if the product reference is somehow missing or deleted
      if (!product) {
        continue;
      }

      // Default the discount to 0 if the product doesn't have an active sale
      let discount = 0;
      if (product.discountPercent) {
        discount = product.discountPercent;
      }

      // Automatically construct the database record linking the product and delivery address
      const newOrder = await Order.create({
        status: 'waiting',
        drinkName: product.name,
        quantity: cartItem.quantity,
        discount: discount,
        userId: userId,
        address: address,
        phone: phone,
        notes: notes,
      });
      
      createdOrders.push(newOrder);
    }

    // Save user profile details automatically
    if (userId) {
      await User.findByIdAndUpdate(userId, { address, phone });
    }

    // Clear cart after order creation.
    const cartItemIds = cart.items.map((i) => i._id);
    await CartItem.deleteMany({ _id: { $in: cartItemIds } });
    cart.items = [];
    await cart.save();

    return res.status(201).json({ orders: createdOrders });
  } catch (err) {
    return next(err);
  }
}

export async function listAllOrders(req, res, next) {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (err) {
    return next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['paid', 'waiting', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: { message: 'status must be paid, waiting or cancelled' } });
    }

    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: { message: 'Order not found' } });

    return res.status(200).json({ order: updated });
  } catch (err) {
    return next(err);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: { message: 'Unauthorized' } });

    const order = await Order.findOne({ _id: id, userId });
    if (!order) return res.status(404).json({ error: { message: 'Order not found' } });
    
    if (order.status !== 'waiting') return res.status(400).json({ error: { message: 'Only waiting orders can be cancelled' } });
    
    order.status = 'cancelled';
    await order.save();
    return res.status(200).json({ order });
  } catch (err) {
    return next(err);
  }
}

