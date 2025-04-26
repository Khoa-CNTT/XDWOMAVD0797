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

// Lấy danh sách sản phẩm
router.get('/products', (req, res) => {
    const { category, search } = req.query;
    console.log('Query params:', { category, search });
    
    let query = `
        SELECT p.*, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 1
    `;
    let params = [];
    
    if (category && category !== '0' && category !== 'Tất cả' && category !== '') {
        query += ' AND c.name = ?';
        params.push(category);
    }
    
    if (search) {
        query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
        params.push(`%${search}%`);
        params.push(`%${search}%`);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    console.log('SQL Query:', query);
    console.log('Query params:', params);
    
    connection.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ 
                error: 'Lỗi khi lấy danh sách sản phẩm',
                details: err.message 
            });
            return;
        }
        
        console.log(`Found ${results.length} products`);
        console.log('Products:', results);
        
        res.json({
            products: results,
            total: results.length
        });
    });
});

// Thêm sản phẩm mới
router.post('/products', (req, res) => {
    const { title, price, description, category_id, img } = req.body;
    
    const query = `
        INSERT INTO products 
        (title, price, description, category_id, img, status, created_at) 
        VALUES (?, ?, ?, ?, ?, 1, NOW())
    `;
    
    connection.query(query, [title, price, description, category_id, img], (err, result) => {
        if (err) {
            console.error('Lỗi khi thêm sản phẩm:', err);
            res.status(500).json({ error: 'Lỗi khi thêm sản phẩm' });
            return;
        }
        
        res.json({ 
            message: 'Thêm sản phẩm thành công',
            product_id: result.insertId 
        });
    });
});

// Cập nhật sản phẩm
router.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { title, price, description, category_id, img } = req.body;
    
    const query = `
        UPDATE products 
        SET title = ?, 
            price = ?, 
            description = ?, 
            category_id = ?, 
            img = ?,
            updated_at = NOW()
        WHERE id = ?
    `;
    
    connection.query(query, [title, price, description, category_id, img, id], (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật sản phẩm:', err);
            res.status(500).json({ error: 'Lỗi khi cập nhật sản phẩm' });
            return;
        }
        
        res.json({ message: 'Cập nhật sản phẩm thành công' });
    });
});

// Xóa sản phẩm (cập nhật status = 0)
router.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'UPDATE products SET status = 0, updated_at = NOW() WHERE id = ?';
    
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Lỗi khi xóa sản phẩm:', err);
            res.status(500).json({ error: 'Lỗi khi xóa sản phẩm' });
            return;
        }
        
        res.json({ message: 'Xóa sản phẩm thành công' });
    });
});

// Lấy danh sách người dùng với bộ lọc
router.get('/users', (req, res) => {
    const { status, search, start, end } = req.query;
    
    let query = `
        SELECT * FROM users 
        WHERE user_type = 0
    `;
    const params = [];

    // Lọc theo trạng thái
    if (status && status != '2') {
        query += ' AND status = ?';
        params.push(status);
    }

    // Tìm kiếm theo tên hoặc số điện thoại
    if (search) {
        query += ' AND (fullname LIKE ? OR phone LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    // Lọc theo thời gian
    if (start && !end) {
        query += ' AND DATE(join_date) >= ?';
        params.push(start);
    } else if (!start && end) {
        query += ' AND DATE(join_date) <= ?';
        params.push(end);
    } else if (start && end) {
        query += ' AND DATE(join_date) BETWEEN ? AND ?';
        params.push(start, end);
    }

    query += ' ORDER BY join_date DESC';

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách người dùng:', err);
            res.status(500).json({ error: 'Lỗi khi lấy danh sách người dùng' });
            return;
        }
        res.json(results);
    });
});

// Lấy thông tin một người dùng
router.get('/users/:phone', (req, res) => {
    const { phone } = req.params;
    
    const query = 'SELECT * FROM users WHERE phone = ? AND user_type = 0';
    connection.query(query, [phone], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy thông tin người dùng:', err);
            res.status(500).json({ error: 'Lỗi khi lấy thông tin người dùng' });
            return;
        }
        
        if (results.length === 0) {
            res.status(404).json({ error: 'Không tìm thấy người dùng' });
            return;
        }
        
        res.json(results[0]);
    });
});

// Xóa người dùng
router.delete('/users/:phone', (req, res) => {
    const { phone } = req.params;
    
    const query = 'DELETE FROM users WHERE phone = ? AND user_type = 0';
    connection.query(query, [phone], (err, result) => {
        if (err) {
            console.error('Lỗi khi xóa người dùng:', err);
            res.status(500).json({ error: 'Lỗi khi xóa người dùng' });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Không tìm thấy người dùng' });
            return;
        }
        
        res.json({ message: 'Xóa người dùng thành công' });
    });
});

// Cập nhật thông tin người dùng
router.put('/users/:phone', (req, res) => {
    const { phone } = req.params;
    const { fullname, password, status } = req.body;
    
    const query = 'UPDATE users SET fullname = ?, password = ?, status = ? WHERE phone = ? AND user_type = 0';
    connection.query(query, [fullname, password, status, phone], (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật người dùng:', err);
            res.status(500).json({ error: 'Lỗi khi cập nhật người dùng' });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Không tìm thấy người dùng' });
            return;
        }
        
        res.json({ message: 'Cập nhật thông tin thành công' });
    });
});

// Thêm người dùng mới từ admin
router.post('/users', (req, res) => {
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
                console.error('Lỗi thêm user:', err);
                res.status(500).json({ error: 'Lỗi thêm user' });
                return;
            }
            
            res.json({ 
                message: 'Thêm người dùng thành công',
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

module.exports = router; 