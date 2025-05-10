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
    const { status, search, start, end } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    if (status === '0' || status === '1') {
        query += ' AND status = ?';
        params.push(status);
    }
    if (search) {
        query += ' AND (receiver_name LIKE ? OR id LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if (start && end) {
        // Lấy hết ngày end
        const endDate = new Date(end);
        endDate.setDate(endDate.getDate() + 1);
        const endStr = endDate.toISOString().slice(0, 10);
        query += ' AND created_at >= ? AND created_at < ?';
        params.push(start, endStr);
    }
    query += ' ORDER BY created_at DESC';
    connection.query(query, params, (err, results) => {
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
        WHERE status = 1
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
    
    // Log dữ liệu nhận được
    console.log('Received product data:', { title, price, description, category_id, img });
    
    // Kiểm tra dữ liệu đầu vào
    if (!title || !price || !category_id) {
        console.log('Missing required fields:', { title, price, category_id });
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin sản phẩm' });
    }

    if (isNaN(price) || price <= 0) {
        console.log('Invalid price:', price);
        return res.status(400).json({ error: 'Giá sản phẩm phải là số lớn hơn 0' });
    }

    const query = `
        INSERT INTO products 
        (title, price, description, category_id, img, status, created_at) 
        VALUES (?, ?, ?, ?, ?, 1, NOW())
    `;
    
    // Log query và params
    console.log('SQL Query:', query);
    console.log('Query params:', [title, price, description, category_id, img]);
    
    connection.query(query, [title, price, description, category_id, img], (err, result) => {
        if (err) {
            console.error('Database error details:', err);
            return res.status(500).json({ 
                error: 'Lỗi khi thêm sản phẩm vào database',
                details: err.message 
            });
        }
        
        console.log('Insert result:', result);
        
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

// Lấy danh sách người dùng
router.get('/users', (req, res) => {
    const { status, search, start, end } = req.query;
    
    let query = 'SELECT * FROM users WHERE user_type = 0';
    const params = [];
    
    // Chỉ lọc status nếu là 0 hoặc 1, nếu là 2 (Tất cả) thì bỏ qua
    if (status && status !== '2') {
        query += ' AND status = ?';
        params.push(status);
    }
    
    if (search) {
        query += ' AND (fullname LIKE ? OR phone LIKE ?)';
        params.push(`%${search}%`);
        params.push(`%${search}%`);
    }
    
    if (start && end) {
        // Cộng thêm 1 ngày cho end để lấy hết ngày đó
        const endDate = new Date(end);
        endDate.setDate(endDate.getDate() + 1);
        const endStr = endDate.toISOString().slice(0, 10);
        query += ' AND join_date >= ? AND join_date < ?';
        params.push(start, endStr);
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

// Thêm tài khoản mới
router.post('/users', (req, res) => {
    const { fullname, phone, password, user_type } = req.body;
    
    // Kiểm tra số điện thoại đã tồn tại chưa
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
        const insertQuery = 'INSERT INTO users (fullname, phone, password, status, user_type, join_date) VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP)';
        connection.query(insertQuery, [fullname, phone, password, user_type], (err, result) => {
            if (err) {
                console.error('Lỗi thêm user:', err);
                res.status(500).json({ error: 'Lỗi thêm user' });
                return;
            }
            
            res.json({ 
                message: 'Thêm tài khoản thành công',
                user: {
                    id: result.insertId,
                    fullname,
                    phone,
                    status: 1,
                    user_type
                }
            });
        });
    });
});

// Lấy danh sách danh mục
router.get('/categories', (req, res) => {
    const query = 'SELECT * FROM categories WHERE status = 1 ORDER BY name ASC';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh mục:', err);
            res.status(500).json({ error: 'Lỗi khi lấy danh mục' });
            return;
        }
        res.json(results);
    });
});

// Thống kê sản phẩm bán chạy
router.get('/statistics/products', (req, res) => {
    const { category, search, start, end } = req.query;
    let query = `
        SELECT 
            p.id,
            p.title,
            p.img,
            c.name as category_name,
            SUM(od.quantity) as total_sold,
            SUM(od.price * od.quantity) as total_revenue
        FROM order_details od
        JOIN products p ON od.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        JOIN orders o ON od.order_id = o.id
        WHERE o.status = 1
    `;
    const params = [];
    if (category && category !== 'Tất cả') {
        query += ' AND c.name = ?';
        params.push(category);
    }
    if (search) {
        query += ' AND p.title LIKE ?';
        params.push(`%${search}%`);
    }
    if (start && end) {
        query += ' AND o.created_at >= ? AND o.created_at <= ?';
        params.push(start, end);
    }
    query += `
        GROUP BY p.id
        ORDER BY total_sold DESC
    `;
    connection.query(query, params, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy thống kê sản phẩm:', err);
            res.status(500).json({ error: 'Lỗi khi lấy thống kê sản phẩm' });
            return;
        }
        res.json(results);
    });
});

module.exports = router; 