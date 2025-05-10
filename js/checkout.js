const PHIVANCHUYEN = 30000;
let priceFinal = document.getElementById("checkout-cart-price-final");
// Trang thanh toan
function thanhtoanpage(option,product) {
    // Xu ly ngay nhan hang
    let today = new Date();
    let ngaymai = new Date();
    let ngaykia = new Date();
    ngaymai.setDate(today.getDate() + 1);
    ngaykia.setDate(today.getDate() + 2);
    let dateorderhtml = `<a href="javascript:;" class="pick-date active" data-date="${today}">
        <span class="text">Hôm nay</span>
        <span class="date">${today.getDate()}/${today.getMonth() + 1}</span>
        </a>
        <a href="javascript:;" class="pick-date" data-date="${ngaymai}">
            <span class="text">Ngày mai</span>
            <span class="date">${ngaymai.getDate()}/${ngaymai.getMonth() + 1}</span>
        </a>

        <a href="javascript:;" class="pick-date" data-date="${ngaykia}">
            <span class="text">Ngày kia</span>
            <span class="date">${ngaykia.getDate()}/${ngaykia.getMonth() + 1}</span>
    </a>`
    document.querySelector('.date-order').innerHTML = dateorderhtml;
    let pickdate = document.getElementsByClassName('pick-date')
    for(let i = 0; i < pickdate.length; i++) {
        pickdate[i].onclick = function () {
            document.querySelector(".pick-date.active").classList.remove("active");
            this.classList.add('active');
        }
    }

    let totalBillOrder = document.querySelector('.total-bill-order');
    let totalBillOrderHtml;
    // Xu ly don hang
    switch (option) {
        case 1: // Truong hop thanh toan san pham trong gio
            // Hien thi don hang
            showProductCart();
            // Tinh tien
            totalBillOrderHtml = `<div class="priceFlx">
            <div class="text">
                Tiền hàng 
                <span class="count">${getAmountCart()} món</span>
            </div>
            <div class="price-detail">
                <span id="checkout-cart-total">${vnd(getCartTotal())}</span>
            </div>
        </div>
        <div class="priceFlx chk-ship">
            <div class="text">Phí vận chuyển</div>
            <div class="price-detail chk-free-ship">
                <span>${vnd(PHIVANCHUYEN)}</span>
            </div>
        </div>`;
            // Tong tien
            priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
            break;
        case 2: // Truong hop mua ngay
            // Hien thi san pham
            showProductBuyNow(product);
            // Tinh tien
            totalBillOrderHtml = `<div class="priceFlx">
                <div class="text">
                    Tiền hàng 
                    <span class="count">${product.soluong} món</span>
                </div>
                <div class="price-detail">
                    <span id="checkout-cart-total">${vnd(product.soluong * product.price)}</span>
                </div>
            </div>
            <div class="priceFlx chk-ship">
                <div class="text">Phí vận chuyển</div>
                <div class="price-detail chk-free-ship">
                    <span>${vnd(PHIVANCHUYEN)}</span>
                </div>
            </div>`
            // Tong tien
            priceFinal.innerText = vnd((product.soluong * product.price) + PHIVANCHUYEN);
            break;
    }

    // Tinh tien
    totalBillOrder.innerHTML = totalBillOrderHtml;

    // Thêm phương thức thanh toán (luôn hiển thị khi mở trang checkout, không bị lặp)
    const paymentMethodContainer = document.querySelector('.payment-methods');
    if (!paymentMethodContainer) {
        const checkoutColRight = document.querySelector('.checkout-col-right');
        const paymentMethodsHtml = `
            <div class="payment-methods" style="margin-top:20px; padding:15px; background:#fff; border-radius:5px; border:1px solid #eee;">
                <h3 class="checkout-content-label" style="font-size:16px; margin-bottom:10px;">Phương thức thanh toán</h3>
                <div class="payment-options">
                    <div class="payment-option" style="margin:10px 0; display:flex; align-items:center;">
                        <input type="radio" id="cod" name="payment" value="cod" checked style="margin-right:10px;">
                        <label for="cod" style="font-size:14px; color:#333;">Thanh toán khi nhận hàng (COD)</label>
                    </div>
                    <div class="payment-option" style="margin:10px 0; display:flex; align-items:center;">
                        <input type="radio" id="vnpay" name="payment" value="vnpay" style="margin-right:10px;">
                        <label for="vnpay" style="font-size:14px; color:#333;">Thanh toán qua <img src='https://sandbox.vnpayment.vn/paymentv2/images/logo_vnpay.png' alt='VNPay' style='height:18px;vertical-align:middle;margin-left:2px;'></label>
                    </div>
                </div>
            </div>
        `;
        checkoutColRight.insertAdjacentHTML('beforeend', paymentMethodsHtml);
    }

    // Xu ly hinh thuc giao hang
    let giaotannoi = document.querySelector('#giaotannoi');
    let tudenlay = document.querySelector('#tudenlay');
    let tudenlayGroup = document.querySelector('#tudenlay-group');
    let chkShip = document.querySelectorAll(".chk-ship");
    
    tudenlay.addEventListener('click', () => {
        giaotannoi.classList.remove("active");
        tudenlay.classList.add("active");
        chkShip.forEach(item => {
            item.style.display = "none";
        });
        tudenlayGroup.style.display = "block";
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(getCartTotal());
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price));
                break;
        }
    })

    giaotannoi.addEventListener('click', () => {
        tudenlay.classList.remove("active");
        giaotannoi.classList.add("active");
        tudenlayGroup.style.display = "none";
        chkShip.forEach(item => {
            item.style.display = "flex";
        });
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price) + PHIVANCHUYEN);
                break;
        }
    })

    // Su kien khu nhan nut dat hang
    document.querySelector(".complete-checkout-btn").onclick = () => {
        switch (option) {
            case 1:
                xulyDathang();
                break;
            case 2:
                xulyDathang(product);
                break;
        }
    }
}

// Hiển thị hàng trong giỏ (lấy từ database)
async function showProductCart() {
    let currentuser = JSON.parse(localStorage.getItem('currentuser'));
    let cart = currentuser.cart || [];
    let listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = '';
    let totalQty = 0;
    let totalPrice = 0;
    // Lấy thông tin sản phẩm từ API
    const products = await Promise.all(cart.map(async (item) => {
        const res = await fetch(`/api/products/${item.id}`);
        const prod = await res.json();
        totalQty += item.soluong;
        totalPrice += prod.price * item.soluong;
        return {
            ...prod,
            soluong: item.soluong
        };
    }));
    products.forEach(product => {
        listOrderHtml += `<div class="food-total">
            <div class="count">${product.soluong}x</div>
            <div class="info-food">
                <div class="name-food">${product.title}</div>
            </div>
        </div>`;
    });
    listOrder.innerHTML = listOrderHtml;
    // Cập nhật tổng tiền
    document.getElementById('checkout-cart-total').innerText = vnd(totalPrice);
    document.getElementById('checkout-cart-price-final').innerText = vnd(totalPrice + PHIVANCHUYEN);
}

// Hiển thị hàng mua ngay (lấy từ database)
async function showProductBuyNow(product) {
    let listOrder = document.getElementById("list-order-checkout");
    const res = await fetch(`/api/products/${product.id}`);
    const prod = await res.json();
    let listOrderHtml = `<div class="food-total">
        <div class="count">${product.soluong}x</div>
        <div class="info-food">
            <div class="name-food">${prod.title}</div>
        </div>
    </div>`;
    listOrder.innerHTML = listOrderHtml;
    // Cập nhật tổng tiền
    document.getElementById('checkout-cart-total').innerText = vnd(prod.price * product.soluong);
    document.getElementById('checkout-cart-price-final').innerText = vnd((prod.price * product.soluong) + PHIVANCHUYEN);
}

//Open Page Checkout
document.addEventListener('DOMContentLoaded', function() {
    let nutthanhtoan = document.querySelector('.thanh-toan');
    let checkoutpage = document.querySelector('.checkout-page');
    if (nutthanhtoan) {
        nutthanhtoan.addEventListener('click', () => {
            checkoutpage.classList.add('active');
            thanhtoanpage(1);
            closeCart();
            body.style.overflow = "hidden";
        });
    }
});

// Đặt hàng ngay
function dathangngay() {
    let productInfo = document.getElementById("product-detail-content");
    let datHangNgayBtn = productInfo.querySelector(".button-dathangngay");
    datHangNgayBtn.onclick = () => {
        if(localStorage.getItem('currentuser')) {
            let productId = datHangNgayBtn.getAttribute("data-product");
            let soluong = parseInt(productInfo.querySelector(".buttons_added .input-qty").value);
            let notevalue = productInfo.querySelector("#popup-detail-note").value;
            let ghichu = notevalue == "" ? "Không có ghi chú" : notevalue;
            let products = JSON.parse(localStorage.getItem('products'));
            let a = products.find(item => item.id == productId);
            a.soluong = parseInt(soluong);
            a.note = ghichu;
            checkoutpage.classList.add('active');
            thanhtoanpage(2,a);
            closeCart();
            body.style.overflow = "hidden"
        } else {
            toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
        }
    }
}

// Close Page Checkout
function closecheckout() {
    checkoutpage.classList.remove('active');
    body.style.overflow = "auto"
}

// Thêm phương thức thanh toán VNPay
function addPaymentMethods() {
    const paymentMethodsHtml = `
        <div class="payment-methods">
            <h3 class="checkout-content-label">Phương thức thanh toán</h3>
            <div class="payment-options">
                <div class="payment-option">
                    <input type="radio" id="cod" name="payment" value="cod" checked>
                    <label for="cod">Thanh toán khi nhận hàng (COD)</label>
                </div>
                <div class="payment-option">
                    <input type="radio" id="vnpay" name="payment" value="vnpay">
                    <label for="vnpay">Thanh toán qua VNPay</label>
                </div>
            </div>
        </div>
    `;
    
    document.querySelector('.checkout-col-right').insertAdjacentHTML('beforeend', paymentMethodsHtml);
}

// Lấy giá sản phẩm từ API
async function getpriceProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Không lấy được sản phẩm');
        const product = await response.json();
        return product.price;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

// Lấy thông tin sản phẩm từ API
async function getProductFromDB(id) {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) throw new Error('Không lấy được sản phẩm');
    return await response.json();
}

// Tạo đơn hàng trên database
async function createOrderOnDB(orderData) {
    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Không tạo được đơn hàng');
    return await response.json();
}

// Xử lý đặt hàng (chỉ làm việc với database)
async function xulyDathang(product) {
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    let cart = product ? [product] : (currentUser.cart || []);

    // Lấy thông tin sản phẩm từ DB
    let orderItems = [];
    let tongtien = 0;
    for (const item of cart) {
        const prod = await getProductFromDB(item.id);
        orderItems.push({
            product_id: prod.id,
            quantity: item.soluong,
            price: prod.price,
            note: item.note || ''
        });
        tongtien += prod.price * item.soluong;
    }

    // Lấy thông tin từ form
    let tennguoinhan = document.querySelector("#tennguoinhan").value;
    let sdtnhan = document.querySelector("#sdtnhan").value;
    let diachinhan = document.querySelector("#diachinhan").value;
    let paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    let hinhthucgiao = document.querySelector('.type-order-btn.active').innerText.trim();
    let thoigiangiao = document.querySelector("#giaongay").checked ? "Giao ngay khi xong" : document.querySelector(".choise-time").value;
    let ghichu = document.querySelector(".note-order").value;
    let ngaygiaohang = document.querySelector(".pick-date.active").getAttribute("data-date");

    if(tennguoinhan == "" || sdtnhan == "" || diachinhan == "") {
        toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin !', type: 'warning', duration: 4000 });
        return;
    }

    // Tạo đơn hàng trên DB
    const orderData = {
        user_id: currentUser.id,
        shipping_address: diachinhan,
        total_amount: tongtien,
        status: 'pending',
        payment_method: paymentMethod,
        receiver_name: tennguoinhan,
        receiver_phone: sdtnhan,
        delivery_type: hinhthucgiao,
        delivery_time: thoigiangiao,
        delivery_date: ngaygiaohang,
        note: ghichu,
        items: orderItems
    };
    let orderRes;
    try {
        orderRes = await createOrderOnDB(orderData);
    } catch (error) {
        toast({ title: 'Lỗi', message: error.message, type: 'error', duration: 3000 });
        return;
    }

    // Nếu chọn VNPay, gọi API tạo link thanh toán
    if (paymentMethod === 'vnpay') {
        try {
            const response = await fetch('/api/payment/create_payment_url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderRes.id,
                    amount: tongtien,
                    orderInfo: `Thanh toan don hang ${orderRes.id}`
                })
            });
            const data = await response.json();
            if (data.vnpayUrl) {
                window.location.href = data.vnpayUrl;
            } else {
                throw new Error('Không thể tạo URL thanh toán');
            }
        } catch (error) {
            toast({ title: 'Lỗi', message: 'Không thể tạo thanh toán VNPay', type: 'error', duration: 3000 });
        }
    } else {
        toast({ title: 'Thành công', message: 'Đặt hàng thành công !', type: 'success', duration: 1000 });
        setTimeout(() => {
            window.location = "/";
        }, 2000);
    }
}

// Thêm CSS cho phần thanh toán
const checkoutStyle = document.createElement('style');
checkoutStyle.textContent = `
    .payment-methods {
        margin-top: 20px;
        padding: 15px;
        background: #fff;
        border-radius: 5px;
        border: 1px solid #eee;
    }

    .payment-options {
        margin-top: 10px;
    }

    .payment-option {
        margin: 10px 0;
        display: flex;
        align-items: center;
    }

    .payment-option input[type="radio"] {
        margin-right: 10px;
    }

    .payment-option label {
        font-size: 14px;
        color: #333;
    }
`;
document.head.appendChild(checkoutStyle);

// Gọi hàm thêm phương thức thanh toán khi trang checkout được mở
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.querySelector('.thanh-toan');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            addPaymentMethods();
        });
    }
});