import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGO_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('Set MONGO_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before creating the administrator.');
}
if (ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
await mongoose.connect(MONGO_URI);
const email = ADMIN_EMAIL.toLowerCase().trim();
const existing = await User.findOne({ email });
if (existing) {
  existing.name = ADMIN_NAME.trim();
  existing.password = await bcrypt.hash(ADMIN_PASSWORD, 12);
  existing.role = 'admin';
  await existing.save();
  console.log(`Administrator credentials updated for ${email}.`);
} else {
  await User.create({ name: ADMIN_NAME.trim(), email, password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: 'admin' });
  console.log(`Administrator created for ${email}.`);
}
await mongoose.disconnect();
