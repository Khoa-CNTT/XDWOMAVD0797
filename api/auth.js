const express = require('express');
const router = express.Router();
const connection = require('../config/database');

// Đăng ký tài khoản
router.post('/register', (req, res) => {
    const { fullname, phone, password } = req.body;
    
    // Kiểm tra xem số điện thoại đã tồn tại chưa
    const checkQuery = 'SELECT * FROM users WHERE phone = ?';
    connection.query(checkQuery, [phone], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra số điện thoại:', err);
            res.status(500).json({ error: 'Lỗi đăng ký' });
            return;
        }
        
        if (results.length > 0) {
            res.status(400).json({ error: 'Số điện thoại đã tồn tại' });
            return;
        }

        // Thêm user mới
        const insertQuery = 'INSERT INTO users (fullname, phone, password, status, user_type) VALUES (?, ?, ?, 1, 0)';
        connection.query(insertQuery, [fullname, phone, password], (err, result) => {
            if (err) {
                console.error('Lỗi đăng ký:', err);
                res.status(500).json({ error: 'Lỗi đăng ký' });
                return;
            }
            
            // Lấy thông tin user vừa tạo
            connection.query('SELECT * FROM users WHERE id = ?', [result.insertId], (err, users) => {
                if (err) {
                    console.error('Lỗi lấy thông tin user:', err);
                    res.status(500).json({ error: 'Lỗi đăng ký' });
                    return;
                }
                
                const user = users[0];
                res.json({
                    message: 'Đăng ký thành công',
                    user: {
                        id: user.id,
                        fullname: user.fullname,
                        phone: user.phone,
                        status: user.status,
                        user_type: user.user_type,
                        cart: []
                    }
                });
            });
        });
    });
});

// Đăng nhập
router.post('/login', (req, res) => {
    const { phone, password } = req.body;
    
    const query = 'SELECT * FROM users WHERE phone = ? AND password = ?';
    connection.query(query, [phone, password], (err, results) => {
        if (err) {
            console.error('Lỗi đăng nhập:', err);
            res.status(500).json({ error: 'Lỗi đăng nhập' });
            return;
        }
        
        if (results.length === 0) {
            res.status(401).json({ error: 'Sai số điện thoại hoặc mật khẩu' });
            return;
        }
        
        const user = results[0];
        if (user.status === 0) {
            res.status(403).json({ error: 'Tài khoản đã bị khóa' });
            return;
        }
        
        // Lấy giỏ hàng của user
        connection.query('SELECT * FROM cart WHERE user_id = ?', [user.id], (err, cartItems) => {
            if (err) {
                console.error('Lỗi lấy giỏ hàng:', err);
                res.status(500).json({ error: 'Lỗi đăng nhập' });
                return;
            }
            
            res.json({
                message: 'Đăng nhập thành công',
                user: {
                    id: user.id,
                    fullname: user.fullname,
                    phone: user.phone,
                    status: user.status,
                    user_type: user.user_type,
                    cart: cartItems || []
                }
            });
        });
    });
});

// Quên mật khẩu
router.post('/forgot-password', (req, res) => {
    const { phone } = req.body;
    
    // Kiểm tra xem số điện thoại có tồn tại không
    const query = 'SELECT * FROM users WHERE phone = ?';
    connection.query(query, [phone], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra user:', err);
            res.status(500).json({ error: 'Lỗi kiểm tra user' });
            return;
        }
        
        if (results.length === 0) {
            res.status(404).json({ error: 'Số điện thoại chưa được đăng ký' });
            return;
        }
        
        // Tạo mật khẩu mới ngẫu nhiên
        const tempPassword = Math.random().toString(36).slice(-8);
        
        // Cập nhật mật khẩu mới vào database
        const updateQuery = 'UPDATE users SET password = ? WHERE phone = ?';
        connection.query(updateQuery, [tempPassword, phone], (err, result) => {
            if (err) {
                console.error('Lỗi cập nhật mật khẩu:', err);
                res.status(500).json({ error: 'Lỗi cập nhật mật khẩu' });
                return;
            }
            
            res.json({ 
                message: 'Mật khẩu mới đã được gửi đến số điện thoại của bạn',
                tempPassword: tempPassword // Trong thực tế, bạn nên gửi SMS hoặc email thay vì trả về mật khẩu
            });
        });
    });
});

module.exports = router; 