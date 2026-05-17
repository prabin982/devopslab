const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// Get cart items
router.get('/', auth, (req, res) => {
    try {
        const items = db.prepare(`
      SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
    `).all(req.user.id);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching cart' });
    }
});

// Add to cart
router.post('/add', auth, (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const existing = db.prepare('SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?').get(req.user.id, productId);
        if (existing) {
            db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?').run(quantity || 1, existing.id);
        } else {
            db.prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.user.id, productId, quantity || 1);
        }
        res.json({ message: 'Product added to cart' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding to cart' });
    }
});

// Remove from cart
router.delete('/:id', auth, (req, res) => {
    try {
        db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ message: 'Error removing from cart' });
    }
});

module.exports = router;
