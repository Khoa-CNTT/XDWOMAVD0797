const mysql = require('mysql2');

// Tạo kết nối đến database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'hungryhub',
    port: 3306,
});

// Kết nối đến database
connection.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối đến MySQL:', err);
        return;
    }
    console.log('Đã kết nối thành công đến MySQL');
});

// Xử lý lỗi khi mất kết nối
connection.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        // Tự động kết nối lại nếu mất kết nối
        connection.connect();
    } else {
        throw err;
    }
});

// Export connection
module.exports = connection; 