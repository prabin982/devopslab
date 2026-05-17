const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'ecommerce.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'buyer'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );

  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );
`);

// Seed Data Function
function seedData() {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
        const hashedPassword = bcrypt.hashSync('password123', 10);
        const insertUser = db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
        insertUser.run('prabin', 'prabin@example.com', hashedPassword, 'buyer');
        insertUser.run('john_doe', 'john@example.com', hashedPassword, 'buyer');
        insertUser.run('jane_doe', 'jane@example.com', hashedPassword, 'buyer');
        console.log('Seeded users.');
    }

    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    if (productCount === 0) {
        const insertProduct = db.prepare('INSERT INTO products (name, description, price, category, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)');

        // Electronics
        insertProduct.run('Smartphone X', 'Latest high-end smartphone with OLED display.', 799.99, 'Electronics', 50, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500');
        insertProduct.run('Laptop Pro', 'Powerful laptop for professionals and gamers.', 1299.99, 'Electronics', 30, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500');

        // Clothing
        insertProduct.run('Classic Denim Jacket', 'Timeless style, durable denim material.', 59.99, 'Clothing', 100, 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500');
        insertProduct.run('Cotton T-Shirt', 'Comfortable daily wear t-shirt in white.', 19.99, 'Clothing', 200, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500');

        // Books
        insertProduct.run('Node.js Mastery', 'The ultimate guide to building fast backend services.', 39.99, 'Books', 45, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500');
        insertProduct.run('DevOps Principles', 'Bridging the gap between software and operations.', 45.50, 'Books', 25, 'https://images.unsplash.com/photo-1512428559083-a401a30c9550?w=500');

        // Home & Kitchen
        insertProduct.run('Ceramic Coffee Mug', 'Handcrafted mug for your morning brew.', 12.99, 'Home & Kitchen', 75, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500');
        insertProduct.run('Chef Knife Set', 'Professional 5-piece stainless steel knife set.', 89.99, 'Home & Kitchen', 15, 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500');

        console.log('Seeded products.');
    }
}

seedData();

module.exports = db;
