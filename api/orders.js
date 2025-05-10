const express = require('express');
const router = express.Router();
const connection = require('../config/database');

// Tạo đơn hàng mới
router.post('/', (req, res) => {
    const { user_id, shipping_address, total_amount, status, payment_method, receiver_name, receiver_phone, delivery_type, delivery_time, delivery_date, note, branch, items } = req.body;

    // Thêm đơn hàng vào bảng orders
    const orderQuery = `
        INSERT INTO orders (user_id, shipping_address, total_amount, status, payment_method, receiver_name, receiver_phone, delivery_type, delivery_time, delivery_date, note, branch, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    connection.query(orderQuery, [user_id, shipping_address, total_amount, status, payment_method, receiver_name, receiver_phone, delivery_type, delivery_time, delivery_date, note, branch], (err, result) => {
        if (err) {
            console.error('Lỗi khi tạo đơn hàng:', err);
            return res.status(500).json({ error: 'Lỗi khi tạo đơn hàng' });
        }
        const orderId = result.insertId;

        // Thêm chi tiết đơn hàng vào bảng order_details
        if (Array.isArray(items) && items.length > 0) {
            const detailsQuery = `
                INSERT INTO order_details (order_id, product_id, quantity, price, note)
                VALUES ?
            `;
            const detailsValues = items.map(item => [orderId, item.product_id, item.quantity, item.price, item.note]);
            connection.query(detailsQuery, [detailsValues], (err2) => {
                if (err2) {
                    console.error('Lỗi khi thêm chi tiết đơn hàng:', err2);
                    return res.status(500).json({ error: 'Lỗi khi thêm chi tiết đơn hàng' });
                }
                res.json({ id: orderId, message: 'Tạo đơn hàng thành công' });
            });
        } else {
            res.json({ id: orderId, message: 'Tạo đơn hàng thành công (không có chi tiết)' });
        }
    });
});

// Lấy danh sách đơn hàng của 1 user (và chi tiết từng đơn)
router.get('/user/:userId', (req, res) => {
    const { userId } = req.params;
    const orderQuery = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
    connection.query(orderQuery, [userId], (err, orders) => {
        if (err) return res.status(500).json({ error: 'Lỗi lấy đơn hàng' });
        if (!orders.length) return res.json([]);
        // Lấy chi tiết từng đơn hàng
        const orderIds = orders.map(o => o.id);
        const detailsQuery = 'SELECT od.*, p.title, p.img FROM order_details od LEFT JOIN products p ON od.product_id = p.id WHERE order_id IN (?)';
        connection.query(detailsQuery, [orderIds], (err2, details) => {
            if (err2) return res.status(500).json({ error: 'Lỗi lấy chi tiết đơn hàng' });
            // Gắn chi tiết vào từng đơn
            orders.forEach(order => {
                order.order_details = details.filter(d => d.order_id === order.id);
            });
            res.json(orders);
        });
    });
});

// Hủy đơn hàng
router.put('/cancel/:orderId', (req, res) => {
    const { orderId } = req.params;
    
    // Kiểm tra xem đơn hàng có tồn tại và có thể hủy không
    const checkQuery = 'SELECT * FROM orders WHERE id = ? AND status = 0';
    connection.query(checkQuery, [orderId], (err, results) => {
        if (err) {
            console.error('Lỗi khi kiểm tra đơn hàng:', err);
            return res.status(500).json({ error: 'Lỗi khi kiểm tra đơn hàng' });
        }
        
        if (results.length === 0) {
            return res.status(400).json({ error: 'Không thể hủy đơn hàng này' });
        }
        
        // Cập nhật trạng thái đơn hàng thành đã hủy (status = 2)
        const updateQuery = 'UPDATE orders SET status = 2 WHERE id = ?';
        connection.query(updateQuery, [orderId], (err, result) => {
            if (err) {
                console.error('Lỗi khi hủy đơn hàng:', err);
                return res.status(500).json({ error: 'Lỗi khi hủy đơn hàng' });
            }
            
            res.json({ message: 'Hủy đơn hàng thành công' });
        });
    });
});

module.exports = router; 