const express = require('express');
const router = express.Router();
const connection = require('../config/database');

// Đăng nhập admin
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password }); // Log thông tin đăng nhập
    
    const query = 'SELECT * FROM users WHERE (username = ? OR phone = ?) AND password = ? AND user_type = 1';
    connection.query(query, [username, username, password], (err, results) => {
        if (err) {
            console.error('Lỗi đăng nhập:', err);
            res.status(500).json({ error: 'Lỗi đăng nhập' });
            return;
        }
        console.log('Query results:', results); // Log kết quả truy vấn
        
        if (results.length === 0) {
            res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
            return;
        }
        res.json({ message: 'Đăng nhập thành công', admin: results[0] });
    });
});

// Đăng ký user mới
router.post('/register', (req, res) => {
    const { fullname, phone, password } = req.body;
    
    // Kiểm tra xem số điện thoại đã tồn tại chưa
    const checkQuery = 'SELECT * FROM users WHERE phone = ?';
    connection.query(checkQuery, [phone], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra user:', err);
            res.status(500).json({ error: 'Lỗi kiểm tra user' });
            return;
        }
        
        if (results.length > 0) {
            res.status(400).json({ error: 'Số điện thoại đã được đăng ký' });
            return;
        }
        
        // Thêm user mới
        const insertQuery = 'INSERT INTO users (fullname, phone, password, status, user_type, join_date) VALUES (?, ?, ?, 1, 0, CURRENT_TIMESTAMP)';
        connection.query(insertQuery, [fullname, phone, password], (err, result) => {
            if (err) {
                console.error('Lỗi đăng ký:', err);
                res.status(500).json({ error: 'Lỗi đăng ký' });
                return;
            }
            
            res.json({ 
                message: 'Đăng ký thành công',
                user: {
                    id: result.insertId,
                    fullname,
                    phone,
                    status: 1,
                    user_type: 0
                }
            });
        });
    });
});

// Lấy danh sách đơn hàng
router.get('/orders', (req, res) => {
    const query = 'SELECT * FROM orders ORDER BY created_at DESC';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách đơn hàng:', err);
            res.status(500).json({ error: 'Lỗi khi lấy danh sách đơn hàng' });
            return;
        }
        res.json(results);
    });
});

// Cập nhật trạng thái đơn hàng
router.put('/orders/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const query = 'UPDATE orders SET status = ? WHERE id = ?';
    connection.query(query, [status, id], (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật đơn hàng:', err);
            res.status(500).json({ error: 'Lỗi khi cập nhật đơn hàng' });
            return;
        }
        res.json({ message: 'Cập nhật đơn hàng thành công' });
    });
});

// Thống kê doanh thu
router.get('/statistics', (req, res) => {
    const query = `
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as total_orders,
            SUM(total_amount) as revenue
        FROM orders
        WHERE status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy thống kê:', err);
            res.status(500).json({ error: 'Lỗi khi lấy thống kê' });
            return;
        }
        res.json(results);
    });
});

module.exports = router; 