const express = require('express');
const router = express.Router();
const connection = require('../config/database');
const axios = require('axios');
const removeAccents = require('remove-accents'); // npm install remove-accents

// Thêm hàm helper để format số tiền
function formatPrice(price) {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Thêm hàm helper để lấy thông tin tổng hợp
async function getMenuSummary() {
    try {
        // Lấy tổng số món
        const [totalCount] = await connection.promise().query(
            'SELECT COUNT(*) as total FROM products WHERE status = 1'
        );

        // Lấy số lượng món theo danh mục với tên danh mục
        const [categoryCounts] = await connection.promise().query(`
            SELECT 
                c.id as category_id,
                c.name as category_name,
                COUNT(p.id) as count 
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.status = 1
            GROUP BY c.id, c.name
            ORDER BY c.id ASC
        `);

        // Lấy giá trung bình của các món
        const [avgPrice] = await connection.promise().query(
            'SELECT AVG(price) as avg_price FROM products WHERE status = 1'
        );

        // Lấy giá cao nhất và thấp nhất
        const [priceRange] = await connection.promise().query(`
            SELECT 
                MIN(price) as min_price,
                MAX(price) as max_price
            FROM products 
            WHERE status = 1
        `);

        return {
            total: totalCount[0].total,
            categories: categoryCounts,
            avgPrice: Math.round(avgPrice[0].avg_price),
            minPrice: priceRange[0].min_price,
            maxPrice: priceRange[0].max_price
        };
    } catch (error) {
        console.error('Lỗi khi lấy thông tin tổng hợp:', error);
        throw error;
    }
}

// Thêm hàm helper để xác định danh mục từ câu hỏi
function getCategoryFromMessage(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('chay')) return 'Món chay';
    if (lowerMessage.includes('lẩu')) return 'Món lẩu';
    if (lowerMessage.includes('mặn')) return 'Món mặn';
    if (lowerMessage.includes('nước')) return 'Nước uống';
    if (lowerMessage.includes('tráng miệng')) return 'Món tráng miệng';
    if (lowerMessage.includes('ăn vặt')) return 'Món ăn vặt';
    return null;
}

// API endpoint để lấy câu trả lời từ database
router.post('/response', async (req, res) => {
    const { message } = req.body;
    const lowerMessage = message.toLowerCase();
    
    try {
        // Trả lời tự động về giới thiệu thương hiệu HungryHub
        if (
            lowerMessage.includes('giới thiệu') ||
            lowerMessage.includes('thương hiệu') ||
            lowerMessage.includes('hungryhub') ||
            lowerMessage.includes('hungry hub')
        ) {
            return res.json({
                response: 'HungryHub là thương hiệu nhà hàng nổi tiếng tại Đà Nẵng, chuyên phục vụ các món ăn ngon, đa dạng và chất lượng. Với không gian ấm cúng, đội ngũ nhân viên thân thiện, HungryHub cam kết mang đến trải nghiệm ẩm thực tuyệt vời cho mọi khách hàng. Chúng tôi tự hào là điểm đến lý tưởng cho các bữa ăn gia đình, gặp gỡ bạn bè và các dịp đặc biệt.'
            });
        }
        // Trả lời tự động về giờ mở cửa
        if (
            lowerMessage.includes('giờ mở cửa') ||
            lowerMessage.includes('mấy giờ mở cửa') ||
            lowerMessage.includes('giờ hoạt động') ||
            lowerMessage.includes('thời gian mở cửa') ||
            lowerMessage.includes('giờ đóng cửa') ||
            lowerMessage.includes('giờ làm việc')
        ) {
            return res.json({
                response: 'HungryHub mở cửa từ 9:00 đến 22:30 các ngày trong tuần, và từ 9:00 đến 00:00 các ngày lễ.'
            });
        }
        // Trả lời tự động về thông tin liên hệ
        if (
            lowerMessage.includes('liên hệ') ||
            lowerMessage.includes('địa chỉ') ||
            lowerMessage.includes('số điện thoại') ||
            lowerMessage.includes('hotline') ||
            lowerMessage.includes('email') ||
            lowerMessage.includes('liên lạc')
        ) {
            return res.json({
                response: 'Thông tin liên hệ HungryHub:\n' +
                    '- Địa chỉ: 03 Quang Trung, Phường Hải Châu, Quận Hải Châu, TP.Đà Nẵng\n' +
                    '- Số điện thoại: 0123 456 789 | 0987 654 321\n' +
                    '- Email: abc@domain.com | infoabc@domain.com'
            });
        }
        // Kiểm tra câu hỏi về tổng số món
        if (lowerMessage.includes('tổng số') || lowerMessage.includes('tất cả') || lowerMessage.includes('bao nhiêu món')) {
            const summary = await getMenuSummary();
            let response = `Nhà hàng chúng tôi có tổng cộng ${summary.total} món ăn, bao gồm:\n\n`;
            
            summary.categories.forEach(category => {
                if (category.count > 0) {
                    response += `- ${category.category_name}: ${category.count} món\n`;
                }
            });
            
            response += `\nGiá trung bình: ${formatPrice(summary.avgPrice)}đ\n`;
            response += `Giá thấp nhất: ${formatPrice(summary.minPrice)}đ\n`;
            response += `Giá cao nhất: ${formatPrice(summary.maxPrice)}đ`;
            
            res.json({ response });
        }
        // Kiểm tra câu hỏi về số lượng món theo danh mục cụ thể
        else if (lowerMessage.includes('bao nhiêu') && (lowerMessage.includes('món') || lowerMessage.includes('đồ'))) {
            const category = getCategoryFromMessage(lowerMessage);
            
            if (category) {
                const [categories] = await connection.promise().query(
                    `SELECT c.id, c.name, COUNT(p.id) as count 
                     FROM categories c 
                     LEFT JOIN products p ON c.id = p.category_id AND p.status = 1 
                     WHERE c.name = ? 
                     GROUP BY c.id, c.name`,
                    [category]
                );
                
                if (categories.length > 0) {
                    res.json({ response: `Chúng tôi có ${categories[0].count} món ${categories[0].name.toLowerCase()}` });
                } else {
                    res.json({ response: `Xin lỗi, tôi không tìm thấy danh mục "${category}" trong thực đơn.` });
                }
            } else {
                const summary = await getMenuSummary();
                let response = 'Số lượng món theo từng danh mục:\n\n';
                summary.categories.forEach(category => {
                    if (category.count > 0) {
                        response += `- ${category.category_name}: ${category.count} món\n`;
                    }
                });
                res.json({ response });
            }
        }
        // Kiểm tra câu hỏi về giá trung bình
        else if (lowerMessage.includes('giá trung bình') || lowerMessage.includes('giá trung bình')) {
            const summary = await getMenuSummary();
            res.json({ 
                response: `Giá trung bình của các món ăn là ${formatPrice(summary.avgPrice)}đ. Món rẻ nhất có giá ${formatPrice(summary.minPrice)}đ và món đắt nhất có giá ${formatPrice(summary.maxPrice)}đ.`
            });
        }
        // Kiểm tra câu hỏi về món đắt nhất
        else if (lowerMessage.includes('đắt nhất') || lowerMessage.includes('mắc nhất') || lowerMessage.includes('cao nhất')) {
            const [products] = await connection.promise().query(
                'SELECT * FROM products WHERE status = 1 ORDER BY price DESC LIMIT 1'
            );
            
            if (products.length > 0) {
                const product = products[0];
                res.json({ 
                    response: `Món đắt nhất của chúng tôi là ${product.title} với giá ${formatPrice(product.price)}đ.`
                });
            } else {
                res.json({ response: 'Xin lỗi, tôi không tìm thấy thông tin về món ăn.' });
            }
        }
        // Kiểm tra câu hỏi về món rẻ nhất
        else if (lowerMessage.includes('rẻ nhất') || lowerMessage.includes('rẻ nhất') || lowerMessage.includes('thấp nhất')) {
            const [products] = await connection.promise().query(
                'SELECT * FROM products WHERE status = 1 ORDER BY price ASC LIMIT 1'
            );
            
            if (products.length > 0) {
                const product = products[0];
                res.json({ 
                    response: `Món rẻ nhất của chúng tôi là ${product.title} với giá ${formatPrice(product.price)}đ.`
                });
            } else {
                res.json({ response: 'Xin lỗi, tôi không tìm thấy thông tin về món ăn.' });
            }
        }
        // Kiểm tra câu hỏi về món ăn theo khoảng giá
        else if (lowerMessage.includes('khoảng') && (lowerMessage.includes('đồng') || lowerMessage.includes('đ'))) {
            const priceMatch = lowerMessage.match(/(\d+)(?:\s*-\s*(\d+))?\s*(?:k|nghìn|đồng|đ)/i);
            if (priceMatch) {
                const minPrice = parseInt(priceMatch[1]) * 1000;
                const maxPrice = priceMatch[2] ? parseInt(priceMatch[2]) * 1000 : minPrice + 100000;
                
                const [products] = await connection.promise().query(
                    'SELECT * FROM products WHERE status = 1 AND price BETWEEN ? AND ? ORDER BY price ASC',
                    [minPrice, maxPrice]
                );
                
                if (products.length > 0) {
                    let response = `Các món trong khoảng giá ${formatPrice(minPrice/1000)}k - ${formatPrice(maxPrice/1000)}k:\n\n`;
                    products.forEach(product => {
                        response += `- ${product.title}: ${formatPrice(product.price)}đ\n`;
                    });
                    res.json({ response });
                } else {
                    res.json({ response: `Xin lỗi, chúng tôi không có món nào trong khoảng giá ${formatPrice(minPrice/1000)}k - ${formatPrice(maxPrice/1000)}k.` });
                }
            } else {
                res.json({ response: 'Bạn có thể cho biết khoảng giá cụ thể không?' });
            }
        }
        // Kiểm tra câu hỏi về món ăn theo danh mục
        else if (lowerMessage.includes('món') || lowerMessage.includes('đồ ăn') || lowerMessage.includes('thực đơn')) {
            const category = getCategoryFromMessage(lowerMessage);
            
            let query = `
                SELECT p.*, c.name as category_name 
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.status = 1
            `;
            let params = [];
            
            if (category) {
                query += ' AND c.name = ?';
                params.push(category);
            }
            
            query += ' ORDER BY p.title ASC';
            
            const [products] = await connection.promise().query(query, params);
            
            if (products.length > 0) {
                let response = '';
                if (category) {
                    response += `${category.toUpperCase()}:\n`;
                } else {
                    response += 'TẤT CẢ CÁC MÓN:\n';
                }
                
                products.forEach(product => {
                    response += `- ${product.title}: ${formatPrice(product.price)}đ\n`;
                });
                
                res.json({ response });
            } else {
                if (category) {
                    res.json({ response: `Xin lỗi, tôi không tìm thấy món nào trong danh mục ${category}.` });
                } else {
                    res.json({ response: 'Xin lỗi, tôi không tìm thấy món ăn phù hợp với yêu cầu của bạn.' });
                }
            }
        }
        // Kiểm tra câu hỏi về giá cụ thể
        else if (lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu')) {
            const searchTerm = lowerMessage.replace(/giá|bao nhiêu|tiền|đồng|đ|vnd|vnđ|cho|tôi|biết|món|đồ ăn|thực đơn/g, '').trim();
            if (!searchTerm) {
                res.json({ response: 'Bạn muốn biết giá của món nào?' });
                return;
            }
            const searchTermNoAccent = removeAccents(searchTerm.toLowerCase());
            const [products] = await connection.promise().query('SELECT * FROM products WHERE status = 1');
            const found = products.find(p =>
                removeAccents((p.title || '').toLowerCase()).includes(searchTermNoAccent) ||
                removeAccents((p.description || '').toLowerCase()).includes(searchTermNoAccent)
            );
            if (found) {
                res.json({ 
                    response: `Món ${found.title} có giá ${formatPrice(found.price)}đ.\nChi tiết: ${found.description || 'Không có mô tả.'}`
                });
            } else {
                res.json({ response: 'Xin lỗi, tôi không tìm thấy thông tin về món ăn này.' });
            }
        }
        // Kiểm tra câu hỏi về đánh giá món ăn
        else if (
            lowerMessage.includes('đánh giá') ||
            lowerMessage.includes('review') ||
            lowerMessage.includes('sao')
        ) {
            const searchTerm = lowerMessage.replace(/đánh giá|review|sao|của|món|này|bao nhiêu|mấy|thế nào|cho|tôi|biết|về|được|/g, '').trim();
            if (!searchTerm) {
                return res.json({ response: 'Bạn muốn xem đánh giá của món nào?' });
            }
            const searchTermNoAccent = removeAccents(searchTerm.toLowerCase());
            const [products] = await connection.promise().query('SELECT * FROM products WHERE status = 1');
            const found = products.find(p =>
                removeAccents((p.title || '').toLowerCase()).includes(searchTermNoAccent) ||
                removeAccents((p.description || '').toLowerCase()).includes(searchTermNoAccent)
            );
            if (found) {
                // Gọi API review
                try {
                    const reviewRes = await axios.get(`http://localhost:3000/api/reviews?product_id=${found.id}`);
                    const reviews = reviewRes.data;
                    if (reviews.length === 0) {
                        return res.json({ response: `Món ${found.title} hiện chưa có đánh giá nào.` });
                    }
                    const avgStar = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
                    let reply = `Đánh giá cho món ${found.title}:\n- Số sao trung bình: ${avgStar}/5 (${reviews.length} đánh giá)\n`;
                    reviews.forEach(r => {
                        reply += `- ${r.user_name || 'Người dùng'}: ${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)} - ${r.comment}\n`;
                    });
                    return res.json({ response: reply });
                } catch (err) {
                    return res.json({ response: 'Xin lỗi, không lấy được đánh giá cho món này.' });
                }
            } else {
                return res.json({ response: 'Xin lỗi, tôi không tìm thấy món ăn này.' });
            }
        }
        // Tìm kiếm câu trả lời thông thường
        else {
            const searchTermNoAccent = removeAccents(message.toLowerCase());
            const [products] = await connection.promise().query('SELECT * FROM products WHERE status = 1');
            const found = products.find(p =>
                removeAccents((p.title || '').toLowerCase()).includes(searchTermNoAccent) ||
                removeAccents((p.description || '').toLowerCase()).includes(searchTermNoAccent)
            );
            if (found) {
                res.json({ 
                    response: `Món ${found.title} có giá ${formatPrice(found.price)}đ.\nChi tiết: ${found.description || 'Không có mô tả.'}`
                });
            } else {
                // Nếu không tìm thấy sản phẩm, trả về câu trả lời mặc định
                const [rows] = await connection.promise().query(
                    'SELECT response FROM chatbot_responses WHERE LOWER(question) LIKE LOWER(?)',
                    [`%${searchTermNoAccent}%`]
                );
                if (rows.length > 0) {
                    res.json({ response: rows[0].response });
                } else {
                    res.json({ 
                        response: 'Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về thực đơn, giá cả hoặc đặt hàng.' 
                    });
                }
            }
        }
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi xử lý yêu cầu' });
    }
});

// API endpoint để thêm câu hỏi và câu trả lời mới (chỉ dành cho admin)
router.post('/add', async (req, res) => {
    const { question, response, category } = req.body;
    
    try {
        await connection.promise().query(
            'INSERT INTO chatbot_responses (question, response, category) VALUES (?, ?, ?)',
            [question, response, category]
        );
        res.json({ message: 'Đã thêm câu trả lời mới thành công' });
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi thêm câu trả lời' });
    }
});

module.exports = router; 