const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_ecommerce_key';

// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
        const result = stmt.run(username, email, hashedPassword);

        res.status(201).json({ message: 'User registered successfully', userId: result.lastInsertRowid });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Profile
const auth = require('../middleware/auth');
router.get('/profile', auth, (req, res) => {
    try {
        const user = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?').get(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

module.exports = router;
