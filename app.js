require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productsRouter = require('./api/products');
const adminRouter = require('./api/admin');
const authRouter = require('./api/auth');
const paymentRoutes = require('./api/payment');
const ordersRouter = require('./api/orders');
const chatbotRouter = require('./api/chatbot');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Routes
app.use('/api/products', productsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', ordersRouter);
app.use('/api/chatbot', chatbotRouter);

// Route cho trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route cho trang admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Có lỗi xảy ra!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
}); 