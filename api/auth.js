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
    
    // Kiểm tra dữ liệu đầu vào
    if (!phone || !password) {
        console.log('Thiếu thông tin đăng nhập:', { phone, password });
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ số điện thoại và mật khẩu' });
    }
    
    console.log('Đăng nhập với:', { phone, password });
    
    const query = 'SELECT * FROM users WHERE phone = ? AND password = ?';
    connection.query(query, [phone, password], (err, results) => {
        if (err) {
            console.error('Lỗi đăng nhập:', err);
            return res.status(500).json({ error: 'Lỗi đăng nhập' });
        }
        
        console.log('Kết quả truy vấn:', results);
        
        if (results.length === 0) {
            console.log('Không tìm thấy tài khoản với số điện thoại:', phone);
            return res.status(401).json({ error: 'Sai số điện thoại hoặc mật khẩu' });
        }
        
        const user = results[0];
        console.log('Tìm thấy user:', user);
        
        if (user.status === 0) {
            console.log('Tài khoản bị khóa:', user);
            return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
        }
        
        // Lấy giỏ hàng của user
        connection.query('SELECT * FROM cart WHERE user_id = ?', [user.id], (err, cartItems) => {
            if (err) {
                console.error('Lỗi lấy giỏ hàng:', err);
                return res.status(500).json({ error: 'Lỗi đăng nhập' });
            }
            
            console.log('Giỏ hàng của user:', cartItems);
            
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

// Đổi mật khẩu
router.put('/change-password', (req, res) => {
    const { phone, oldPassword, newPassword } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!phone || !oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // Kiểm tra mật khẩu cũ
    const checkQuery = 'SELECT * FROM users WHERE phone = ? AND password = ?';
    connection.query(checkQuery, [phone, oldPassword], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra mật khẩu:', err);
            return res.status(500).json({ error: 'Lỗi kiểm tra mật khẩu' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
        }
        
        // Cập nhật mật khẩu mới
        const updateQuery = 'UPDATE users SET password = ? WHERE phone = ?';
        connection.query(updateQuery, [newPassword, phone], (err, result) => {
            if (err) {
                console.error('Lỗi cập nhật mật khẩu:', err);
                return res.status(500).json({ error: 'Lỗi cập nhật mật khẩu' });
            }
            
            res.json({ 
                message: 'Đổi mật khẩu thành công'
            });
        });
    });
});

// Cập nhật thông tin người dùng
router.put('/update-profile', (req, res) => {
    const { phone, fullname, email, address } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!phone) {
        return res.status(400).json({ error: 'Vui lòng cung cấp số điện thoại' });
    }

    // Cập nhật thông tin user
    const updateQuery = 'UPDATE users SET fullname = ?, email = ?, address = ? WHERE phone = ?';
    connection.query(updateQuery, [fullname, email, address, phone], (err, result) => {
        if (err) {
            console.error('Lỗi cập nhật thông tin:', err);
            return res.status(500).json({ error: 'Lỗi cập nhật thông tin' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        
        res.json({ 
            message: 'Cập nhật thông tin thành công'
        });
    });
});

// Lấy thông tin người dùng
router.get('/user-info', (req, res) => {
    const { phone } = req.query;
    
    if (!phone) {
        return res.status(400).json({ error: 'Vui lòng cung cấp số điện thoại' });
    }

    const query = 'SELECT fullname, phone, email, address FROM users WHERE phone = ?';
    connection.query(query, [phone], (err, results) => {
        if (err) {
            console.error('Lỗi lấy thông tin user:', err);
            return res.status(500).json({ error: 'Lỗi lấy thông tin user' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        
        res.json({ 
            user: results[0]
        });
    });
});

module.exports = router; 