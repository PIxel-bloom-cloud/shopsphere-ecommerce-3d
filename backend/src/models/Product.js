import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String, default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Product', productSchema);
