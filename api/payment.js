const express = require('express');
const router = express.Router();

// Tạo URL thanh toán VNPay (mẫu)
router.post('/create_payment_url', (req, res) => {
    // Ở đây bạn sẽ xử lý tạo URL thật với thông tin đơn hàng
    // Để test frontend, trả về URL mẫu
    res.json({ vnpayUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?dummy=1' });
});

module.exports = router; 