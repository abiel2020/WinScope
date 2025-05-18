import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase, closeConnection, getCollection } from '../config/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    await connectToDatabase();
    const usersCollection = getCollection('users');
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, password: hashedPassword, createdAt: new Date() };
    await usersCollection.insertOne(newUser);
    await closeConnection();
    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    await closeConnection();
    return res.status(500).json({ error: 'Signup failed.', details: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    await connectToDatabase();
    const usersCollection = getCollection('users');
    const user = await usersCollection.findOne({ email });
    if (!user) {
      await closeConnection();
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await closeConnection();
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Issue JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    await closeConnection();
    return res.json({ token, email: user.email });
  } catch (error) {
    await closeConnection();
    return res.status(500).json({ error: 'Login failed.', details: error.message });
  }
});

export default router;
