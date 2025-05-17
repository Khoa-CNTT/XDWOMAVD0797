const express = require('express');
const router = express.Router();
const connection = require('../config/database');

// Kiểm tra user đã mua sản phẩm chưa
async function hasPurchased(userId, productId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT od.product_id
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            WHERE o.user_id = ? AND o.status = 1 AND od.product_id = ?
        `;
        connection.query(sql, [userId, productId], (err, results) => {
            if (err) {
                console.error('Lỗi kiểm tra đã mua:', err);
                return reject(err);
            }
            resolve(results.length > 0);
        });
    });
}

// API tạo đánh giá
router.post('/', async (req, res) => {
    const { user_id, product_id, rating, comment } = req.body;
    try {
        // Kiểm tra đã mua chưa
        const purchased = await hasPurchased(user_id, product_id);
        if (!purchased) {
            return res.status(400).json({ error: 'Bạn chưa mua sản phẩm này!' });
        }
        // Kiểm tra đã đánh giá chưa
        connection.query(
            'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?',
            [user_id, product_id],
            (err, results) => {
                if (err) {
                    console.error('Lỗi kiểm tra đã đánh giá:', err);
                    return res.status(500).json({ error: 'Lỗi server khi kiểm tra đánh giá' });
                }
                if (results.length > 0) {
                    return res.status(400).json({ error: 'Bạn đã đánh giá sản phẩm này rồi!' });
                }
                // Thêm đánh giá
                connection.query(
                    'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
                    [user_id, product_id, rating, comment],
                    (err, result) => {
                        if (err) {
                            console.error('Lỗi khi thêm đánh giá:', err);
                            return res.status(500).json({ error: 'Lỗi server khi thêm đánh giá' });
                        }
                        res.json({ success: true, message: 'Đánh giá thành công!' });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Lỗi server ngoài:', error);
        res.status(500).json({ error: 'Lỗi server ngoài' });
    }
});

// API lấy danh sách đánh giá theo sản phẩm
router.get('/', (req, res) => {
    const { product_id } = req.query;
    connection.query(
        'SELECT r.*, u.fullname as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC',
        [product_id],
        (err, results) => {
            if (err) {
                console.error('Lỗi lấy danh sách đánh giá:', err);
                return res.status(500).json({ error: 'Lỗi server khi lấy danh sách đánh giá' });
            }
            res.json(results);
        }
    );
});

module.exports = router; 