// Hàm hiển thị sản phẩm
function displayProducts(products) {
    const productContainer = document.querySelector('.product-list'); // Thay đổi selector này theo cấu trúc HTML của bạn
    productContainer.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price.toLocaleString('vi-VN')}đ</p>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    Thêm vào giỏ hàng
                </button>
            </div>
        `;
        productContainer.appendChild(productElement);
    });
}

// Hàm lấy danh sách sản phẩm
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
    }
}

// Hàm lọc sản phẩm theo danh mục
async function showCategory(category) {
    try {
        const response = await fetch(`/api/products/category/${encodeURIComponent(category)}`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Lỗi khi lọc sản phẩm:', error);
    }
}

// Hàm thêm sản phẩm mới
async function addProduct(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const productData = {
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        image: formData.get('image'),
        category: formData.get('category')
    };

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            showToast('Thêm sản phẩm thành công');
            form.reset();
            loadProducts(); // Tải lại danh sách sản phẩm
        } else {
            const error = await response.json();
            showToast(error.error || 'Lỗi khi thêm sản phẩm', 'error');
        }
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        showToast('Lỗi khi thêm sản phẩm', 'error');
    }
}

// Hàm cập nhật sản phẩm
async function updateProduct(event) {
    event.preventDefault();
    const form = event.target;
    const productId = form.dataset.productId;
    const formData = new FormData(form);
    const productData = {
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        image: formData.get('image'),
        category: formData.get('category')
    };

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            showToast('Cập nhật sản phẩm thành công');
            loadProducts(); // Tải lại danh sách sản phẩm
        } else {
            const error = await response.json();
            showToast(error.error || 'Lỗi khi cập nhật sản phẩm', 'error');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        showToast('Lỗi khi cập nhật sản phẩm', 'error');
    }
}

// Hàm xóa sản phẩm
async function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Xóa sản phẩm thành công');
            loadProducts(); // Tải lại danh sách sản phẩm
        } else {
            const error = await response.json();
            showToast(error.error || 'Lỗi khi xóa sản phẩm', 'error');
        }
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        showToast('Lỗi khi xóa sản phẩm', 'error');
    }
}

// Hàm tìm kiếm sản phẩm
async function searchProducts(keyword) {
    try {
        const response = await fetch(`/api/products/search?keyword=${encodeURIComponent(keyword)}`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error);
        showToast('Lỗi khi tìm kiếm sản phẩm', 'error');
    }
}

// Hàm phân trang
async function loadProductsByPage(page) {
    try {
        const response = await fetch(`/api/products/page/${page}`);
        const products = await response.json();
        displayProducts(products);
        updatePaginationUI(page);
    } catch (error) {
        console.error('Lỗi khi tải trang:', error);
        showToast('Lỗi khi tải trang', 'error');
    }
}

// Hàm cập nhật giao diện phân trang
function updatePaginationUI(currentPage) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    // Tạo các nút phân trang
    let paginationHTML = '';
    for (let i = 1; i <= 5; i++) { // Giả sử có 5 trang
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="loadProductsByPage(${i})">
                ${i}
            </button>
        `;
    }
    paginationContainer.innerHTML = paginationHTML;
}

// Tải sản phẩm khi trang được load
document.addEventListener('DOMContentLoaded', loadProducts); 