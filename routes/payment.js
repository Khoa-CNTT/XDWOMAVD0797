const express = require('express');
const router = express.Router();
const { createVNPayUrl, verifyReturnUrl } = require('../config/vnpay');
const db = require('../config/database');

// Tạo URL thanh toán VNPay
router.post('/create_payment_url', async (req, res) => {
    try {
        const { orderId, amount, orderInfo } = req.body;
        
        // Tạo URL thanh toán
        const vnpayUrl = createVNPayUrl(orderId, amount, orderInfo);
        
        // Cập nhật trạng thái đơn hàng
        await db.query(
            'UPDATE orders SET payment_status = ? WHERE id = ?',
            ['pending', orderId]
        );

        res.json({ vnpayUrl });
    } catch (error) {
        console.error('Error creating payment URL:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Xử lý callback từ VNPay
router.get('/vnpay_return', async (req, res) => {
    try {
        const vnpParams = req.query;
        
        // Kiểm tra tính hợp lệ của dữ liệu trả về
        const isValid = verifyReturnUrl(vnpParams);
        
        if (isValid) {
            const orderId = vnpParams['vnp_TxnRef'];
            const rspCode = vnpParams['vnp_ResponseCode'];
            
            if (rspCode === '00') {
                // Thanh toán thành công
                await db.query(
                    'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
                    ['completed', 'processing', orderId]
                );
                
                res.redirect('/payment/success');
            } else {
                // Thanh toán thất bại
                await db.query(
                    'UPDATE orders SET payment_status = ? WHERE id = ?',
                    ['failed', orderId]
                );
                
                res.redirect('/payment/failed');
            }
        } else {
            res.redirect('/payment/failed');
        }
    } catch (error) {
        console.error('Error processing VNPay return:', error);
        res.redirect('/payment/failed');
    }
});

module.exports = router; 