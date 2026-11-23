import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product.js';

if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
await mongoose.connect(process.env.MONGO_URI);
const catalogue = [
  { name: 'Minimalist Watch', category: 'Accessories', price: 2499, stock: 18, featured: true, description: 'A clean everyday watch with a timeless silhouette.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900' },
  { name: 'Studio Headphones', category: 'Electronics', price: 3999, stock: 12, featured: true, description: 'Comfortable over-ear headphones for work and play.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900' },
  { name: 'Everyday Backpack', category: 'Lifestyle', price: 1899, stock: 25, description: 'A versatile carry-all for daily essentials.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900' },
  { name: 'Classic Sneakers', category: 'Fashion', price: 3299, stock: 9, featured: true, description: 'Simple low-top sneakers built for everyday comfort.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900' },
  { name: 'Desk Lamp', category: 'Lifestyle', price: 1499, stock: 16, description: 'Warm focused light for a calmer workspace.', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900' },
  { name: 'Wireless Speaker', category: 'Electronics', price: 2799, stock: 14, description: 'Compact sound for your room or weekend trips.', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900' }
];
let added = 0;
for (const item of catalogue) {
  if (!(await Product.exists({ name: item.name }))) { await Product.create(item); added++; }
}
console.log(`Catalogue ready. ${added} products added; existing products were preserved.`);
await mongoose.disconnect();
