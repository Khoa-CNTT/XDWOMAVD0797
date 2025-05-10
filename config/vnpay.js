const crypto = require('crypto');
const moment = require('moment');

const config = {
    vnp_TmnCode: "YOUR_MERCHANT_CODE", // Mã website tại VNPAY 
    vnp_HashSecret: "YOUR_HASH_SECRET", // Chuỗi bí mật
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_ReturnUrl: "http://localhost:3000/payment/vnpay_return", // URL sau khi thanh toán xong
};

function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

function createVNPayUrl(orderId, amount, orderInfo, orderType = 'billpayment') {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    const orderId = orderId.toString();
    const amount = amount * 100; // Số tiền * 100

    const vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: config.vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_Amount: amount,
        vnp_ReturnUrl: config.vnp_ReturnUrl,
        vnp_IpAddr: '127.0.0.1',
        vnp_CreateDate: createDate,
    };

    const sortedParams = sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnpParams.vnp_SecureHash = signed;
    const vnpUrl = config.vnp_Url + '?' + querystring.stringify(vnpParams, { encode: false });

    return vnpUrl;
}

function verifyReturnUrl(vnpParams) {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 

    return secureHash === signed;
}

module.exports = {
    createVNPayUrl,
    verifyReturnUrl
}; 