
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// Public user information (never expose password)
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

// Generate authentication token
const issueToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');

    if (
      name.length < 2 ||
      name.length > 80 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        message: 'Please enter a valid name, email and password.'
      });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    console.log('[REGISTER] Account created:', email);

    return res.status(201).json({
      message: 'Account created successfully.',
      token: issueToken(user),
      user: publicUser(user)
    });

  } catch (error) {
    console.error('[REGISTER ERROR]', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    return res.status(500).json({
      message: 'Could not create account.'
    });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();

    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    // Find account
    const user = await User.findOne({ email });

    console.log('[LOGIN] Account found:', Boolean(user));

    if (!user) {
      return res.status(401).json({
        message: 'Email or password is incorrect.'
      });
    }

    // Verify password
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    console.log('[LOGIN] Password matches:', passwordMatches);

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Email or password is incorrect.'
      });
    }

    // Generate JWT
    const token = issueToken(user);

    console.log('[LOGIN] Successful:', email);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: publicUser(user)
    });

  } catch (error) {
    console.error('[LOGIN ERROR]', error.message);

    return res.status(500).json({
      message: 'Login failed due to a server error.'
    });
  }
});

export default router;
