import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, image: String, price: Number, quantity: Number }],
  shippingAddress: { fullName: String, phone: String, address: String, city: String, postalCode: String },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  status: { type: String, enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' }
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);
