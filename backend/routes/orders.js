const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// Place order
router.post('/place', auth, (req, res) => {
    try {
        const cartItems = db.prepare(`
      SELECT c.product_id, c.quantity, p.price 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
    `).all(req.user.id);

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // Start transaction
        const transaction = db.transaction(() => {
            const orderStmt = db.prepare('INSERT INTO orders (user_id, total_price) VALUES (?, ?)');
            const orderResult = orderStmt.run(req.user.id, totalPrice);
            const orderId = orderResult.lastInsertRowid;

            const itemStmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
            const updateStockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

            for (const item of cartItems) {
                itemStmt.run(orderId, item.product_id, item.quantity, item.price);
                updateStockStmt.run(item.quantity, item.product_id);
            }

            db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
            return orderId;
        });

        const orderId = transaction();
        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (err) {
        res.status(500).json({ message: 'Error placing order: ' + err.message });
    }
});

// View order history
router.get('/history', auth, (req, res) => {
    try {
        const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
        const fullOrders = orders.map(order => {
            const items = db.prepare(`
        SELECT oi.*, p.name 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(order.id);
            return { ...order, items };
        });
        res.json(fullOrders);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching order history' });
    }
});

module.exports = router;
