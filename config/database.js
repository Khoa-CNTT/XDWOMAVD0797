const mysql = require('mysql2');

// Tạo kết nối đến database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'hungryhub'
});

// Kết nối đến database
connection.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối đến MySQL:', err);
        return;
    }
    console.log('Đã kết nối thành công đến MySQL');
});

// Export connection
module.exports = connection; 