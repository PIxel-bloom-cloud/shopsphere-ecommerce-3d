import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = Router();
const cleanProduct = body => ({
  name: String(body.name || '').trim(),
  description: String(body.description || '').trim(),
  category: String(body.category || '').trim(),
  price: Number(body.price),
  stock: Number(body.stock),
  image: String(body.image || '').trim(),
  featured: Boolean(body.featured)
});
const validate = p => {
  if (p.name.length < 2 || p.name.length > 120) return 'Product name must be between 2 and 120 characters.';
  if (!p.description || p.description.length > 2000) return 'A product description is required (maximum 2,000 characters).';
  if (!p.category || p.category.length > 60) return 'A valid category is required.';
  if (!Number.isFinite(p.price) || p.price <= 0) return 'Price must be greater than zero.';
  if (!Number.isInteger(p.stock) || p.stock < 0) return 'Stock must be a non-negative whole number.';
  if (p.image && !/^https:\/\//i.test(p.image)) return 'Product image must use a secure HTTPS URL.';
  return null;
};
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.category && req.query.category !== 'All') filter.category = String(req.query.category).slice(0, 60);
  if (req.query.search) filter.name = { $regex: String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 80), $options: 'i' };
  res.json(await Product.find(filter).sort({ featured: -1, createdAt: -1 }));
});
router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found.' });
  res.json(p);
});
router.post('/', protect, adminOnly, async (req, res) => {
  const product = cleanProduct(req.body);
  const issue = validate(product);
  if (issue) return res.status(400).json({ message: issue });
  res.status(201).json(await Product.create(product));
});
router.put('/:id', protect, adminOnly, async (req, res) => {
  const product = cleanProduct(req.body);
  const issue = validate(product);
  if (issue) return res.status(400).json({ message: issue });
  const p = await Product.findByIdAndUpdate(req.params.id, product, { new: true, runValidators: true });
  if (!p) return res.status(404).json({ message: 'Product not found.' });
  res.json(p);
});
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found.' });
  res.json({ message: 'Product deleted.' });
});
export default router;
