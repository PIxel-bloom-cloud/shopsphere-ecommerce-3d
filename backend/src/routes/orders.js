import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = Router();
const statuses = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

router.post('/', protect, async (req, res) => {
  const { items, shippingAddress } = req.body;
  const required = ['fullName', 'phone', 'address', 'city', 'postalCode'];
  if (!Array.isArray(items) || !items.length || items.length > 50 || !shippingAddress || required.some(k => !String(shippingAddress[k] || '').trim())) {
    return res.status(400).json({ message: 'A valid cart and complete delivery details are required.' });
  }
  const session = await mongoose.startSession();
  try {
    let created;
    await session.withTransaction(async () => {
      const orderItems = []; let total = 0;
      for (const item of items) {
        if (!mongoose.isValidObjectId(item.productId)) throw new Error('One of the selected products is invalid.');
        const qty = Number(item.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 99) throw new Error('Product quantity must be between 1 and 99.');
        const product = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: qty } },
          { $inc: { stock: -qty } }, { new: true, session }
        );
        if (!product) throw new Error('A product is unavailable or does not have enough stock. Please refresh your cart.');
        orderItems.push({ product: product._id, name: product.name, image: product.image, price: product.price, quantity: qty });
        total += product.price * qty;
      }
      [created] = await Order.create([{ user: req.user._id, items: orderItems, shippingAddress, total, paymentMethod: 'Cash on Delivery' }], { session });
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: e.message || 'Could not place order.' });
  } finally { await session.endSession(); }
});
router.get('/my', protect, async (req, res) => res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })));
router.get('/', protect, adminOnly, async (req, res) => res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 })));
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  if (!statuses.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' });
  const session = await mongoose.startSession();
  try {
    let updated;
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);
      if (!order) throw new Error('Order not found.');
      if (order.status === 'Cancelled' && req.body.status !== 'Cancelled') throw new Error('A cancelled order cannot be reopened.');
      if (req.body.status === 'Cancelled' && order.status !== 'Cancelled') {
        for (const item of order.items) if (item.product) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }, { session });
      }
      order.status = req.body.status;
      await order.save({ session });
      updated = order;
    });
    res.json(updated);
  } catch (e) { res.status(e.message === 'Order not found.' ? 404 : 400).json({ message: e.message }); }
  finally { await session.endSession(); }
});
export default router;
