const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get all products or filter by category
router.get('/', (req, res) => {
    const { category } = req.query;
    try {
        let products;
        if (category) {
            products = db.prepare('SELECT * FROM products WHERE category = ?').all(category);
        } else {
            products = db.prepare('SELECT * FROM products').all();
        }
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get single product
router.get('/:id', (req, res) => {
    try {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product details' });
    }
});

module.exports = router;
