const express = require('express');
const router = express.Router();
const connection = require('../config/database');

// Lấy tất cả sản phẩm
router.get('/', (req, res) => {
    connection.query('SELECT * FROM products', (error, results) => {
        if (error) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            res.status(500).json({ error: 'Lỗi khi lấy danh sách sản phẩm' });
            return;
        }
        res.json(results);
    });
});

// Lấy chi tiết sản phẩm theo ID
router.get('/:id', (req, res) => {
    const productId = req.params.id;
    connection.query('SELECT * FROM products WHERE id = ?', [productId], (error, results) => {
        if (error) {
            console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
            res.status(500).json({ error: 'Lỗi khi lấy chi tiết sản phẩm' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
            return;
        }
        res.json(results[0]);
    });
});

// Lấy sản phẩm theo danh mục
router.get('/category/:category', (req, res) => {
    const category = req.params.category;
    const query = 'SELECT * FROM products WHERE category = ?';
    connection.query(query, [category], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy sản phẩm theo danh mục:', err);
            res.status(500).json({ error: 'Lỗi khi lấy sản phẩm theo danh mục' });
            return;
        }
        res.json(results);
    });
});

// Tìm kiếm sản phẩm
router.get('/search', (req, res) => {
    const keyword = req.query.keyword;
    const query = 'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?';
    const searchTerm = `%${keyword}%`;
    connection.query(query, [searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Lỗi khi tìm kiếm sản phẩm:', err);
            res.status(500).json({ error: 'Lỗi khi tìm kiếm sản phẩm' });
            return;
        }
        res.json(results);
    });
});

// Thêm sản phẩm mới
router.post('/', (req, res) => {
    const { title, price, description, img, category_id } = req.body;
    const query = 'INSERT INTO products (name, price, description, img, category_id) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [title, price, description, img, category_id], (err, result) => {
        if (err) {
            console.error('Lỗi khi thêm sản phẩm:', err);
            res.status(500).json({ error: 'Lỗi khi thêm sản phẩm' });
            return;
        }
        res.json({ id: result.insertId, message: 'Thêm sản phẩm thành công' });
    });
});

// Cập nhật sản phẩm
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { title, price, description, img, category_id } = req.body;
    const query = 'UPDATE products SET title = ?, price = ?, description = ?, img = ?, category_id = ? WHERE id = ?';
    connection.query(query, [title, price, description, img, category_id, id], (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật sản phẩm:', err);
            res.status(500).json({ error: 'Lỗi khi cập nhật sản phẩm' });
            return;
        }
        res.json({ message: 'Cập nhật sản phẩm thành công' });
    });
});

// Xóa sản phẩm
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM products WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Lỗi khi xóa sản phẩm:', err);
            res.status(500).json({ error: 'Lỗi khi xóa sản phẩm' });
            return;
        }
        res.json({ message: 'Xóa sản phẩm thành công' });
    });
});

module.exports = router; 