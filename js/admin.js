function checkLogin() {
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  if (currentUser == null || currentUser.userType == 0) {
    document.querySelector(
      "body"
    ).innerHTML = `<div class="access-denied-section">
            <img class="access-denied-img" src="./assets/img/access-denied.webp" alt="">
        </div>`;
  } else {
    document.getElementById("name-acc").innerHTML = currentUser.fullname;
  }
}
window.onload = checkLogin();

//do sidebar open and close
const menuIconButton = document.querySelector(".menu-icon-btn");
const sidebar = document.querySelector(".sidebar");
menuIconButton.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// log out admin user
/*
let toogleMenu = document.querySelector(".profile");
let mune = document.querySelector(".profile-cropdown");
toogleMenu.onclick = function () {
    mune.classList.toggle("active");
};
*/

// tab for section
const sidebars = document.querySelectorAll(".sidebar-list-item.tab-content");
const sections = document.querySelectorAll(".section");

for (let i = 0; i < sidebars.length; i++) {
  sidebars[i].onclick = function () {
    document
      .querySelector(".sidebar-list-item.active")
      .classList.remove("active");
    document.querySelector(".section.active").classList.remove("active");
    sidebars[i].classList.add("active");
    sections[i].classList.add("active");
  };
}

const closeBtn = document.querySelectorAll(".section");
console.log(closeBtn[0]);
for (let i = 0; i < closeBtn.length; i++) {
  closeBtn[i].addEventListener("click", (e) => {
    sidebar.classList.add("open");
  });
}

// Get amount product
async function getAmoumtProduct() {
    try {
        const response = await fetch('/api/admin/products');
        if (!response.ok) {
            throw new Error('Lỗi khi lấy số lượng sản phẩm');
        }
        const data = await response.json();
        return data.products.length;
    } catch (error) {
        console.error('Lỗi:', error);
        return 0;
    }
}

// Get amount user
async function getAmoumtUser() {
    try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
            throw new Error('Lỗi khi lấy số lượng người dùng');
        }
        const data = await response.json();
        return data.length;
    } catch (error) {
        console.error('Lỗi:', error);
        return 0;
    }
}

// Get amount money
async function getMoney() {
    try {
        const response = await fetch('/api/admin/statistics');
        if (!response.ok) {
            throw new Error('Lỗi khi lấy thống kê doanh thu');
        }
        const data = await response.json();
        return data.reduce((sum, item) => sum + item.revenue, 0);
    } catch (error) {
        console.error('Lỗi:', error);
        return 0;
    }
}

// Update statistics on page load
async function updateStatistics() {
    try {
        const [productCount, userCount, totalRevenue] = await Promise.all([
            getAmoumtProduct(),
            getAmoumtUser(),
            getMoney()
        ]);
        
        document.getElementById("amount-product").innerHTML = productCount;
        document.getElementById("amount-user").innerHTML = userCount;
        document.getElementById("doanh-thu").innerHTML = vnd(totalRevenue);
    } catch (error) {
        console.error('Lỗi khi cập nhật thống kê:', error);
        toast({
            title: "Error",
            message: "Không thể cập nhật thống kê",
            type: "error",
            duration: 3000,
        });
    }
}

// Call updateStatistics when page loads
window.addEventListener('load', updateStatistics);

// Định dạng tiền Việt Nam đồng
function vnd(price) {
    return parseInt(price).toLocaleString('vi-VN') + " đ";
}

// Pagination variables
let perPage = 12;
let currentPage = 1;
let totalPage = 0;
let perProducts = [];

// Load products when page loads
window.addEventListener('load', function() {
    loadCategories();
    showProduct();
    fetch('/api/products')
        .then(res => res.json())
        .then(products => localStorage.setItem('products', JSON.stringify(products)));
});

// Load danh mục sản phẩm
async function loadCategories() {
    try {
        const response = await fetch('/api/admin/categories');
        if (!response.ok) {
            throw new Error('Lỗi khi lấy danh mục');
        }
        const categories = await response.json();
        
        // Cập nhật select box với danh mục
        const categorySelect = document.getElementById('the-loai');
        categorySelect.innerHTML = '<option value="Tất cả">Tất cả</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        // Thêm event listener cho select danh mục
        categorySelect.addEventListener('change', function() {
    console.log('Category changed to:', this.value);
            currentPage = 1; // Reset về trang 1 khi thay đổi danh mục
    showProduct();
});

    } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
        toast({
            title: 'Lỗi',
            message: 'Không thể tải danh mục sản phẩm',
            type: 'error',
            duration: 3000
        });
    }
}

// Cập nhật hàm showProduct
async function showProduct() {
    try {
        const selectOp = document.getElementById("the-loai").value;
        const searchInput = document.getElementById("form-search-product").value;
        
        // Tạo query string cho API
        let queryParams = new URLSearchParams();
        
        // Xử lý lọc theo danh mục
        if (selectOp && selectOp !== "Tất cả") {
            queryParams.append('category', selectOp);
        }
        
        // Xử lý tìm kiếm
        if (searchInput) {
            queryParams.append('search', searchInput);
        }
        
        console.log('Query params:', queryParams.toString());
        
        // Gọi API để lấy danh sách sản phẩm
        const response = await fetch(`/api/admin/products?${queryParams}`);
        if (!response.ok) {
            throw new Error('Lỗi khi lấy danh sách sản phẩm');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        const products = data.products;
        
        // Hiển thị danh sách sản phẩm với phân trang
        displayList(products, perPage, currentPage);
        setupPagination(products, perPage);
        
    } catch (error) {
        console.error('Lỗi:', error);
        toast({
            title: 'Lỗi',
            message: 'Không thể tải danh sách sản phẩm',
            type: 'error',
            duration: 3000
        });
    }
}

// Display list with pagination
function displayList(products, perPage, currentPage) {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const paginatedProducts = products.slice(start, end);
    
        let productHtml = "";
    if (paginatedProducts.length === 0) {
            productHtml = `<div class="no-result">
                <div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div>
                <div class="no-result-h">Không có sản phẩm để hiển thị</div>
            </div>`;
        } else {
        paginatedProducts.forEach((product) => {
                let btnCtl = product.status == 1
                    ? `<button class="btn-delete" onclick="deleteProduct(${product.id})"><i class="fa-regular fa-trash"></i></button>`
                    : `<button class="btn-delete" onclick="changeStatusProduct(${product.id})"><i class="fa-regular fa-eye"></i></button>`;
                
                productHtml += `
                    <div class="list" data-id="${product.id}">
                        <div class="list-left">
                            <img src="${product.img}" alt="${product.title}">
                            <div class="list-info">
                                <h4>${product.title}</h4>
                                <p class="list-note">${product.description || ''}</p>
                                <span class="list-category">${product.category_name || 'Chưa phân loại'}</span>
                            </div>
                        </div>
                        <div class="list-right">
                            <div class="list-price">
                                <span class="list-current-price">${vnd(product.price)}</span>                   
                            </div>
                            <div class="list-control">
                                <div class="list-tool">
                                    <button class="btn-edit" onclick="editProduct(${product.id})">
                                        <i class="fa-light fa-pen-to-square"></i>
                                    </button>
                                    ${btnCtl}
                                </div>                       
                            </div>
                        </div> 
                    </div>`;
            });
        }
        document.getElementById("show-product").innerHTML = productHtml;
}

// Setup pagination
function setupPagination(products, perPage) {
    const pageCount = Math.ceil(products.length / perPage);
    const paginationList = document.querySelector(".page-nav-list");
    paginationList.innerHTML = "";
    
    for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement("li");
        li.classList.add("page-nav-item");
        if (i === currentPage) li.classList.add("active");
        
        li.innerHTML = `<a href="#">${i}</a>`;
        li.addEventListener("click", () => {
            currentPage = i;
  displayList(products, perPage, currentPage);
            
            // Update active state
            document.querySelectorAll(".page-nav-item").forEach(item => {
                item.classList.remove("active");
            });
            li.classList.add("active");
        });
        
        paginationList.appendChild(li);
    }
}

// Cancel Search Product
async function cancelSearchProduct() {
    try {
        // Reset search values
        document.getElementById("the-loai").value = "Tất cả";
        document.getElementById("form-search-product").value = "";
        
        // Reset current page
        currentPage = 1;
        
        // Show all products
        await showProduct();
    
  } catch (error) {
    console.error('Lỗi:', error);
    toast({
            title: "Error",
            message: "Không thể làm mới danh sách sản phẩm",
            type: "error",
            duration: 3000,
    });
  }
}

// Thêm event listener cho ô tìm kiếm
document.getElementById('form-search-product').addEventListener('input', function() {
    currentPage = 1; // Reset về trang 1 khi tìm kiếm
    showProduct();
});

// Xóa sản phẩm
async function deleteProduct(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
    return;
  }

  try {
    // Hiển thị loading
    const productItem = document.querySelector(`.product-item[data-id="${id}"]`);
    if (productItem) {
      productItem.style.opacity = '0.5';
      productItem.style.pointerEvents = 'none';
    }

    const response = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi khi xóa sản phẩm');
    }

    // Hiển thị thông báo thành công
    toast({
      title: 'Thành công',
      message: 'Xóa sản phẩm thành công',
      type: 'success',
      duration: 3000
    });

    // Làm mới danh sách sản phẩm
    showProduct();
    
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    
    // Khôi phục trạng thái sản phẩm nếu có lỗi
    const productItem = document.querySelector(`.product-item[data-id="${id}"]`);
    if (productItem) {
      productItem.style.opacity = '1';
      productItem.style.pointerEvents = 'auto';
    }
    
    toast({
      title: 'Lỗi',
      message: error.message,
      type: 'error',
      duration: 3000
    });
  }
}

function changeStatusProduct(id) {
  let products = JSON.parse(localStorage.getItem("products"));
  let index = products.findIndex((item) => {
    return item.id == id;
  });
  if (confirm("Bạn có chắc chắn muốn hủy xóa?") == true) {
    products[index].status = 1;
    toast({
      title: "Success",
      message: "Khôi phục sản phẩm thành công !",
      type: "success",
      duration: 3000,
    });
  }
  localStorage.setItem("products", JSON.stringify(products));
  showProduct();
}

async function editProduct(id) {
  window.editingProductId = id; // Lưu lại ID sản phẩm đang sửa
  // Gọi API lấy chi tiết sản phẩm
  const response = await fetch(`/api/products/${id}`);
  if (!response.ok) {
    toast({ title: "Lỗi", message: "Không lấy được thông tin sản phẩm", type: "error", duration: 3000 });
    return;
  }
  const product = await response.json();

  // Hiển thị modal chỉnh sửa
  document.querySelectorAll(".add-product-e").forEach((item) => {
    item.style.display = "none";
  });
  document.querySelectorAll(".edit-product-e").forEach((item) => {
    item.style.display = "block";
  });
  document.querySelector(".add-product").classList.add("open");

  // Gán dữ liệu vào form
  document.querySelector(".upload-image-preview").src = product.img;
  document.getElementById("ten-mon").value = product.title;
  document.getElementById("gia-moi").value = product.price;
  document.getElementById("mo-ta").value = product.description || "";
  document.getElementById("chon-mon").value = product.category_name || product.category || "";
}

function getPathImage(path) {
  let patharr = path.split("/");
  return "./assets/img/products/" + patharr[patharr.length - 1];
}

// Open Popup Modal
let btnAddProduct = document.getElementById("btn-add-product");
btnAddProduct.addEventListener("click", () => {
  window.editingProductId = null; // Reset ID khi thêm mới
  document.querySelectorAll(".add-product-e").forEach((item) => {
    item.style.display = "block";
  });
  document.querySelectorAll(".edit-product-e").forEach((item) => {
    item.style.display = "none";
  });
  document.querySelector(".add-product").classList.add("open");
  // Reset form
  document.getElementById("ten-mon").value = "";
  document.getElementById("gia-moi").value = "";
  document.getElementById("mo-ta").value = "";
  document.getElementById("chon-mon").selectedIndex = 0;
  document.querySelector(".upload-image-preview").src = "./assets/img/blank-image.png";
});

// Close Popup Modal
let closePopup = document.querySelectorAll(".modal-close");
let modalPopup = document.querySelectorAll(".modal");

for (let i = 0; i < closePopup.length; i++) {
  closePopup[i].onclick = () => {
    modalPopup[i].classList.remove("open");
  };
}

// Hàm upload ảnh
function uploadImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.upload-image-preview').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Đổi trạng thái đơn hàng
async function changeStatus(id, el) {
  try {
    // Gọi API để cập nhật trạng thái đơn hàng
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 1 })
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
    // Cập nhật giao diện nút
    el.classList.remove("btn-chuaxuly");
    el.classList.add("btn-daxuly");
    el.innerHTML = "Đã xử lý";
    // Gọi lại findOrder để load lại danh sách đúng với bộ lọc hiện tại
    await findOrder();
    toast({
      title: 'Thành công',
      message: 'Cập nhật trạng thái đơn hàng thành công!',
      type: 'success',
      duration: 2000
    });
  } catch (error) {
    toast({
      title: 'Lỗi',
      message: error.message,
      type: 'error',
      duration: 3000
    });
  }
}

// Format Date
function formatDate(date) {
  let fm = new Date(date);
  let yyyy = fm.getFullYear();
  let mm = fm.getMonth() + 1;
  let dd = fm.getDate();
  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  return dd + "/" + mm + "/" + yyyy;
}

// Show order
function showOrder(arr) {
  let orderHtml = "";
  if (!arr || arr.length == 0) {
    orderHtml = `<td colspan="6">Không có dữ liệu</td>`;
  } else {
    arr.forEach((item) => {
      let status =
        (item.status == 0 || item.status === 'pending')
          ? `<span class="status-no-complete">Chưa xử lý</span>`
          : `<span class="status-complete">Đã xử lý</span>`;
      let date = formatDate(item.created_at);
      orderHtml += `
            <tr>
            <td>${item.id}</td>
            <td>${item.receiver_name || item.khachhang || ''}</td>
            <td>${date}</td>
            <td>${vnd(item.total_amount || item.tongtien || 0)}</td>                               
            <td>${status}</td>
            <td class="control">
            <button class="btn-detail" onclick="detailOrder('${item.id}')"><i class="fa-regular fa-eye"></i> Chi tiết</button>
            </td>
            </tr>      
            `;
    });
  }
  document.getElementById("showOrder").innerHTML = orderHtml;
}

window.onload = showOrder;

// Get Order Details
function getOrderDetails(madon) {
  let orderDetails = localStorage.getItem("orderDetails")
    ? JSON.parse(localStorage.getItem("orderDetails"))
    : [];
  let ctDon = [];
  orderDetails.forEach((item) => {
    if (item.madon == madon) {
      ctDon.push(item);
    }
  });
  return ctDon;
}

// Show Order Detail
async function detailOrder(id) {
  // Lấy danh sách đơn hàng từ API
  const response = await fetch('/api/admin/orders');
  const orders = await response.json();
  const order = orders.find(item => String(item.id) === String(id));
  if (!order) {
    alert("Không tìm thấy đơn hàng!");
    return;
  }

  // Nếu backend trả về order_details thì hiển thị, nếu không thì bỏ qua
  let spHtml = `<div class="modal-detail-left"><div class="order-item-group">`;
  (order.order_details || []).forEach((item) => {
    spHtml += `<div class="order-product">
      <div class="order-product-left">
        <img src="${item.img || ''}" alt="">
        <div class="order-product-info">
          <h4>${item.title || ''}</h4>
          <p class="order-product-note"><i class="fa-light fa-pen"></i> ${item.note || ''}</p>
          <p class="order-product-quantity">SL: ${item.quantity || 0}<p>
        </div>
      </div>
      <div class="order-product-right">
        <div class="order-product-price">
          <span class="order-product-current-price">${vnd(item.price || 0)}</span>
        </div>                         
      </div>
    </div>`;
  });
  spHtml += `</div></div>`;

  spHtml += `<div class="modal-detail-right">
    <ul class="detail-order-group">
      <li class="detail-order-item">
        <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
        <span class="detail-order-item-right">${formatDate(order.created_at)}</span>
      </li>
      <li class="detail-order-item">
        <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
        <span class="detail-order-item-right">${order.delivery_type || ''}</span>
      </li>
      <li class="detail-order-item">
        <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
        <span class="detail-order-item-right">${order.receiver_name || ''}</span>
      </li>
      <li class="detail-order-item">
        <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại</span>
        <span class="detail-order-item-right">${order.receiver_phone || ''}</span>
      </li>
      <li class="detail-order-item tb">
        <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Thời gian giao</span>
        <p class="detail-order-item-b">${order.delivery_time || ''} - ${formatDate(order.delivery_date)}</p>
      </li>
      <li class="detail-order-item tb">
        <span class="detail-order-item-t"><i class="fa-light fa-location-dot"></i> Địa chỉ nhận</span>
        <p class="detail-order-item-b">${
          order.delivery_type === 'Tự đến lấy'
            ? (order.branch || 'Không có thông tin')
            : (order.shipping_address || 'Không có thông tin')
        }</p>
      </li>
      <li class="detail-order-item tb">
        <span class="detail-order-item-t"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
        <p class="detail-order-item-b">${order.note || ''}</p>
      </li>
    </ul>
  </div>`;

  document.querySelector(".modal-detail-order").innerHTML = spHtml;

  let classDetailBtn = (order.status == 0 || order.status === 'pending') ? "btn-chuaxuly" : "btn-daxuly";
  let textDetailBtn = (order.status == 0 || order.status === 'pending') ? "Chưa xử lý" : "Đã xử lý";
  document.querySelector(
    ".modal-detail-bottom"
  ).innerHTML = `<div class="modal-detail-bottom-left">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(order.total_amount || 0)}</span>
        </div>
    </div>
    <div class="modal-detail-bottom-right">
        <button class="modal-detail-btn ${classDetailBtn}" onclick="changeStatus('${order.id}',this)">${textDetailBtn}</button>
    </div>`;
  document.querySelector(".modal.detail-order").classList.add("open");
}

// Find Order
async function findOrder() {
  const tinhTrang = document.getElementById("tinh-trang").value;
  const searchInput = document.getElementById("form-search-order").value;
  const timeStart = document.getElementById("time-start").value;
  const timeEnd = document.getElementById("time-end").value;
  let url = '/api/admin/orders?';
  const params = [];
  if (tinhTrang !== "2") params.push(`status=${tinhTrang}`);
  if (searchInput) params.push(`search=${encodeURIComponent(searchInput)}`);
  if (timeStart) params.push(`start=${encodeURIComponent(timeStart)}`);
  if (timeEnd) params.push(`end=${encodeURIComponent(timeEnd)}`);
  url += params.join('&');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Lỗi khi lấy danh sách đơn hàng');
    const orders = await response.json();
    showOrder(Array.isArray(orders) ? orders : []);
  } catch (error) {
    toast({
      title: 'Lỗi',
      message: error.message,
      type: 'error',
      duration: 3000
    });
    showOrder([]);
  }
}

window.onload = findOrder;

// Create Object Thong ke
function createObj() {
  let orders = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("order"))
    : [];
  let products = localStorage.getItem("products")
    ? JSON.parse(localStorage.getItem("products"))
    : [];
  let orderDetails = localStorage.getItem("orderDetails")
    ? JSON.parse(localStorage.getItem("orderDetails"))
    : [];
  let result = [];
  orderDetails.forEach((item) => {
    // Lấy thông tin sản phẩm
    let prod = products.find((product) => {
      return product.id == item.id;
    });
    let obj = new Object();
    obj.id = item.id;
    obj.madon = item.madon;
    obj.price = item.price;
    obj.quantity = item.soluong;
    obj.category = (prod && (prod.category || prod.category_name)) ? (prod.category || prod.category_name) : 'Chưa phân loại';
    obj.title = prod ? prod.title : '';
    obj.img = prod ? prod.img : '';
    obj.time = orders.find((order) => order.id == item.madon).thoigiandat;
    result.push(obj);
  });
  return result;
}

// Filter
function thongKe(mode) {
  let categoryTk = document.getElementById("the-loai-tk").value;
  let ct = document.getElementById("form-search-tk").value;
  let timeStart = document.getElementById("time-start-tk").value;
  let timeEnd = document.getElementById("time-end-tk").value;
  if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
    alert("Lựa chọn thời gian sai !");
    return;
  }
  let arrDetail = createObj();
  let result =
    categoryTk == "Tất cả"
      ? arrDetail
      : arrDetail.filter((item) => {
          return item.category == categoryTk;
        });

  result =
    ct == ""
      ? result
      : result.filter((item) => {
          return item.title.toLowerCase().includes(ct.toLowerCase());
        });

  if (timeStart != "" && timeEnd == "") {
    result = result.filter((item) => {
      return new Date(item.time) > new Date(timeStart).setHours(0, 0, 0);
    });
  } else if (timeStart == "" && timeEnd != "") {
    result = result.filter((item) => {
      return new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59);
    });
  } else if (timeStart != "" && timeEnd != "") {
    result = result.filter((item) => {
      return (
        new Date(item.time) > new Date(timeStart).setHours(0, 0, 0) &&
        new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59)
      );
    });
  }
  showThongKe(result, mode);
}

// Show số lượng sp, số lượng đơn bán, doanh thu
function showOverview(arr) {
  document.getElementById("quantity-product").innerText = arr.length;
  document.getElementById("quantity-order").innerText = arr.reduce(
    (sum, cur) => sum + parseInt(cur.quantity),
    0
  );
  document.getElementById("quantity-sale").innerText = vnd(
    arr.reduce((sum, cur) => sum + parseInt(cur.doanhthu), 0)
  );
}

function showThongKe(arr, mode) {
  let orderHtml = "";
  let mergeObj = mergeObjThongKe(arr);
  showOverview(mergeObj);

  switch (mode) {
    case 0:
      mergeObj = mergeObjThongKe(createObj());
      showOverview(mergeObj);
      document.getElementById("the-loai-tk").value = "Tất cả";
      document.getElementById("form-search-tk").value = "";
      document.getElementById("time-start-tk").value = "";
      document.getElementById("time-end-tk").value = "";
      break;
    case 1:
      mergeObj.sort((a, b) => parseInt(a.quantity) - parseInt(b.quantity));
      break;
    case 2:
      mergeObj.sort((a, b) => parseInt(b.quantity) - parseInt(a.quantity));
      break;
  }
  for (let i = 0; i < mergeObj.length; i++) {
    orderHtml += `
        <tr>
        <td>${i + 1}</td>
        <td><div class="prod-img-title"><img class="prd-img-tbl" src="${
          mergeObj[i].img
        }" alt=""><p>${mergeObj[i].title}</p></div></td>
        <td>${mergeObj[i].quantity}</td>
        <td>${vnd(mergeObj[i].doanhthu)}</td>
        <td><button class="btn-detail product-order-detail" data-id="${
          mergeObj[i].id
        }"><i class="fa-regular fa-eye"></i> Chi tiết</button></td>
        </tr>      
        `;
  }
  document.getElementById("showTk").innerHTML = orderHtml;
  document.querySelectorAll(".product-order-detail").forEach((item) => {
    let idProduct = item.getAttribute("data-id");
    item.addEventListener("click", () => {
      detailOrderProduct(arr, idProduct);
    });
  });
}

showThongKe(createObj());

function mergeObjThongKe(arr) {
  let result = [];
  arr.forEach((item) => {
    let check = result.find((i) => i.id == item.id); // Không tìm thấy gì trả về undefined

    if (check) {
      check.quantity = parseInt(check.quantity) + parseInt(item.quantity);
      check.doanhthu += parseInt(item.price) * parseInt(item.quantity);
    } else {
      const newItem = { ...item };
      newItem.doanhthu = newItem.price * newItem.quantity;
      result.push(newItem);
    }
  });
  return result;
}

function detailOrderProduct(arr, id) {
  let orderHtml = "";
  arr.forEach((item) => {
    if (item.id == id) {
      orderHtml += `<tr>
            <td>${item.madon}</td>
            <td>${item.quantity}</td>
            <td>${vnd(item.price)}</td>
            <td>${formatDate(item.time)}</td>
            </tr>      
            `;
    }
  });
  document.getElementById("show-product-order-detail").innerHTML = orderHtml;
  document.querySelector(".modal.detail-order-product").classList.add("open");
}

// User
let addAccount = document.getElementById("signup-button");
let updateAccount = document.getElementById("btn-update-account");

document
  .querySelector(".modal.signup .modal-close")
  .addEventListener("click", () => {
    signUpFormReset();
  });

function openCreateAccount() {
  document.querySelector(".signup").classList.add("open");
  document.querySelectorAll(".edit-account-e").forEach((item) => {
    item.style.display = "none";
  });
  document.querySelectorAll(".add-account-e").forEach((item) => {
    item.style.display = "block";
  });
}

function signUpFormReset() {
  document.getElementById("fullname").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("password").value = "";
  document.querySelector(".form-message-name").innerHTML = "";
  document.querySelector(".form-message-phone").innerHTML = "";
  document.querySelector(".form-message-password").innerHTML = "";
}

// Show User Array
function showUserArr(users) {
  let accountHtml = "";
    if (users.length == 0) {
    accountHtml = `<td colspan="5">Không có dữ liệu</td>`;
  } else {
        users.forEach((user, index) => {
            let tinhtrang = user.status == 0
          ? `<span class="status-no-complete">Bị khóa</span>`
          : `<span class="status-complete">Hoạt động</span>`;
      accountHtml += `<tr>
            <td>${index + 1}</td>
                <td>${user.fullname}</td>
                <td>${user.phone}</td>
                <td>${formatDate(user.join_date)}</td>
            <td>${tinhtrang}</td>
            <td class="control control-table">
                    <button class="btn-edit" id="edit-account" onclick='editAccount("${user.phone}")'>
                        <i class="fa-light fa-pen-to-square"></i>
                    </button>
                    <button class="btn-delete" id="delete-account" onclick="deleteAcount('${user.phone}')">
                        <i class="fa-regular fa-trash"></i>
                    </button>
            </td>
        </tr>`;
    });
  }
  document.getElementById("show-user").innerHTML = accountHtml;
}

// Show User with filters
async function showUser() {
    try {
        const tinhTrang = parseInt(document.getElementById("tinh-trang-user").value);
        const searchInput = document.getElementById("form-search-user").value;
        const timeStart = document.getElementById("time-start-user").value;
        const timeEnd = document.getElementById("time-end-user").value;

  if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
            alert("Lựa chọn thời gian sai!");
    return;
  }

        // Tạo query string cho API
        let queryParams = new URLSearchParams({
            status: tinhTrang,
            search: searchInput,
            start: timeStart,
            end: timeEnd
        });

        // Gọi API để lấy danh sách người dùng
        const response = await fetch(`/api/admin/users?${queryParams}`);
        if (!response.ok) {
            throw new Error('Lỗi khi lấy danh sách người dùng');
        }

        const users = await response.json();
        showUserArr(users);

    } catch (error) {
        console.error('Lỗi:', error);
        toast({
            title: "Error",
            message: "Không thể lấy danh sách người dùng",
            type: "error",
            duration: 3000,
        });
    }
}

// Delete Account
async function deleteAcount(phone) {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
        const response = await fetch(`/api/admin/users/${phone}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Lỗi khi xóa tài khoản');
        }

    toast({
      title: "Thành công",
      message: "Xóa tài khoản thành công!",
      type: "success",
      duration: 3000,
    });
    showUser();
    } catch (error) {
        console.error('Lỗi:', error);
        toast({
            title: "Error",
            message: "Không thể xóa tài khoản",
            type: "error",
            duration: 3000,
        });
    }
}

// Edit Account
async function editAccount(phone) {
    try {
        const response = await fetch(`/api/admin/users/${phone}`);
        if (!response.ok) {
            throw new Error('Lỗi khi lấy thông tin tài khoản');
        }
        const user = await response.json();
        document.querySelector(".signup").classList.add("open");
        document.querySelectorAll(".add-account-e").forEach((item) => {
            item.style.display = "none";
        });
        document.querySelectorAll(".edit-account-e").forEach((item) => {
            item.style.display = "block";
        });
        document.getElementById("fullname").value = user.fullname;
        document.getElementById("phone").value = user.phone;
        document.getElementById("password").value = user.password;
        document.getElementById("user-status").checked = user.status == 1;
        // Lưu lại password và status hiện tại để dùng khi cập nhật
        window.editingUserPassword = user.password;
        window.editingUserStatus = user.status;
    } catch (error) {
        console.error('Lỗi:', error);
        toast({
            title: "Error",
            message: "Không thể lấy thông tin tài khoản",
            type: "error",
            duration: 3000,
        });
    }
}

// Cancel Search User
async function cancelSearchUser() {
    try {
        document.getElementById("tinh-trang-user").value = 2;
        document.getElementById("form-search-user").value = "";
        document.getElementById("time-start-user").value = "";
        document.getElementById("time-end-user").value = "";
        await showUser();
    } catch (error) {
        console.error('Lỗi:', error);
        toast({
            title: "Error",
            message: "Không thể hủy tìm kiếm",
            type: "error",
            duration: 3000,
        });
    }
}

// Add event listener for page load
window.addEventListener('load', showUser);

updateAccount.addEventListener("click", async (e) => {
  e.preventDefault();
  const phone = document.getElementById("phone").value;
  const fullname = document.getElementById("fullname").value;
  const password = document.getElementById("password").value || window.editingUserPassword;
  const status = document.getElementById("user-status").checked ? 1 : 0;
  if (fullname == "" || phone == "" || password == "") {
    toast({
      title: "Chú ý",
      message: "Vui lòng nhập đầy đủ thông tin !",
      type: "warning",
      duration: 3000,
    });
  } else {
    try {
      const response = await fetch(`/api/admin/users/${phone}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, password, status })
      });
      if (!response.ok) throw new Error('Lỗi khi cập nhật tài khoản');
      toast({
        title: "Thành công",
        message: "Cập nhật thành công!",
        type: "success",
        duration: 3000,
      });
      document.querySelector(".signup").classList.remove("open");
      signUpFormReset();
      showUser(); // reload lại danh sách user từ server
    } catch (error) {
      toast({
        title: "Lỗi",
        message: error.message,
        type: "error",
        duration: 3000,
      });
    }
  }
});

// Add Account and Event Listener
async function handleAddAccount(e) {
    e.preventDefault(); // Ngăn form submit mặc định
    
    const fullNameUser = document.getElementById("fullname").value;
    const phoneUser = document.getElementById("phone").value;
    const passwordUser = document.getElementById("password").value;

  // Check validate
  let fullNameIP = document.getElementById("fullname");
  let formMessageName = document.querySelector(".form-message-name");
  let formMessagePhone = document.querySelector(".form-message-phone");
  let formMessagePassword = document.querySelector(".form-message-password");

  if (fullNameUser.length == 0) {
        formMessageName.innerHTML = "Vui lòng nhập họ và tên";
    fullNameIP.focus();
        return;
  } else if (fullNameUser.length < 3) {
    fullNameIP.value = "";
    formMessageName.innerHTML = "Vui lòng nhập họ và tên lớn hơn 3 kí tự";
        return;
  }

  if (phoneUser.length == 0) {
    formMessagePhone.innerHTML = "Vui lòng nhập vào số điện thoại";
        return;
  } else if (phoneUser.length != 10) {
    formMessagePhone.innerHTML = "Vui lòng nhập vào số điện thoại 10 số";
    document.getElementById("phone").value = "";
        return;
  }

  if (passwordUser.length == 0) {
    formMessagePassword.innerHTML = "Vui lòng nhập mật khẩu";
        return;
  } else if (passwordUser.length < 6) {
    formMessagePassword.innerHTML = "Vui lòng nhập mật khẩu lớn hơn 6 kí tự";
    document.getElementById("password").value = "";
        return;
    }

    try {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
      fullname: fullNameUser,
      phone: phoneUser,
                password: passwordUser
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Lỗi khi thêm người dùng');
        }

      toast({
        title: "Thành công",
            message: "Thêm người dùng thành công!",
        type: "success",
        duration: 3000,
      });
        
        // Đóng form và reset
      document.querySelector(".signup").classList.remove("open");
      signUpFormReset();
        
        // Làm mới danh sách người dùng
        showUser();
        
    } catch (error) {
        console.error('Lỗi:', error);
      toast({
            title: "Error",
            message: error.message,
        type: "error",
        duration: 3000,
      });
    }
  }

// Add event listener for add account button
const addAccountBtn = document.getElementById("btn-add-account");
if (addAccountBtn) {
    addAccountBtn.addEventListener("click", handleAddAccount);
}

// Add event listener for form submission
const signupForm = document.querySelector('.modal.signup form');
if (signupForm) {
    signupForm.addEventListener('submit', handleAddAccount);
}

document.getElementById("logout-acc").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("currentuser");
  window.location = "/";
});

// Xử lý thêm sản phẩm
document.getElementById("add-product-button").addEventListener("click", async (e) => {
    e.preventDefault(); // Ngăn chặn form submit mặc định
    
    try {
    // Lấy dữ liệu từ form
        const title = document.getElementById("ten-mon").value;
        const price = document.getElementById("gia-moi").value;
        const description = document.getElementById("mo-ta").value;
        const categoryText = document.getElementById("chon-mon").value;
        const imgInput = document.getElementById("up-hinh-anh");
        let img = "";
        if (imgInput && imgInput.files && imgInput.files[0]) {
            img = "assets/img/products/" + imgInput.files[0].name;
        } else {
            // Nếu không upload mới, giữ nguyên ảnh cũ hoặc blank-image
            const previewSrc = document.querySelector(".upload-image-preview").src;
            if (previewSrc.includes("blank-image")) {
                img = "assets/img/products/blank-image.png";
            } else {
                img = previewSrc;
            }
        }

        // Log dữ liệu trước khi gửi
        console.log("Form data:", { title, price, description, categoryText, img });

    // Kiểm tra dữ liệu đầu vào
        if (!title || !price || !categoryText) {
        toast({
                title: "Lỗi",
                message: "Vui lòng điền đầy đủ thông tin sản phẩm",
                type: "error",
            duration: 3000
        });
        return;
    }

        if (isNaN(price) || price <= 0) {
        toast({
                title: "Lỗi",
                message: "Giá sản phẩm phải là số lớn hơn 0",
                type: "error",
            duration: 3000
        });
        return;
    }

        // Gửi request đến server
        const response = await fetch("/api/admin/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                price,
                description,
                categoryText,
                img
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Có lỗi xảy ra!");
        }

        toast({
            title: "Thành công",
            message: "Thêm sản phẩm thành công",
            type: "success",
            duration: 3000
        });

        // Đóng modal và làm mới danh sách sản phẩm
        document.querySelector(".modal.add-product").classList.remove("open");
        await showProduct(); // Đợi cho việc tải lại danh sách sản phẩm hoàn tất
        
        // Reset form
        document.getElementById("ten-mon").value = "";
        document.getElementById("gia-moi").value = "";
        document.getElementById("mo-ta").value = "";
        document.querySelector(".upload-image-preview").src = "./assets/img/blank-image.png";
        
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        toast({
            title: "Lỗi",
            message: error.message,
            type: "error",
            duration: 3000
        });
    }
});

// Thêm event listener cho form để ngăn chặn submit mặc định
const addProductForm = document.querySelector('.add-product-form');
if (addProductForm) {
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
    });
}

// Xử lý form cập nhật sản phẩm
document.getElementById('update-product-button').addEventListener('click', async function(e) {
    e.preventDefault();
    
    const productId = window.editingProductId; // Lấy lại ID đã lưu
    
    // Lấy dữ liệu từ form
    const productData = {
        title: document.getElementById('ten-mon').value.trim(),
        price: parseFloat(document.getElementById('gia-moi').value),
        description: document.getElementById('mo-ta').value.trim(),
        categoryText: document.getElementById('chon-mon').value,
        img: document.querySelector('.upload-image-preview').src
    };

    // Kiểm tra dữ liệu đầu vào
    if (!productData.title || !productData.price || !productData.categoryText) {
        toast({
            title: 'Lỗi',
            message: 'Vui lòng điền đầy đủ thông tin sản phẩm',
            type: 'error',
            duration: 3000
        });
        return;
    }

    if (isNaN(productData.price) || productData.price <= 0) {
        toast({
            title: 'Lỗi',
            message: 'Giá sản phẩm phải là số lớn hơn 0',
            type: 'error',
            duration: 3000
        });
        return;
    }

    try {
        const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Lỗi khi cập nhật sản phẩm');
        }

        // Hiển thị thông báo thành công
        toast({
            title: 'Thành công',
            message: 'Cập nhật sản phẩm thành công',
            type: 'success',
            duration: 3000
        });

        // Đóng modal và làm mới danh sách sản phẩm
        document.querySelector('.modal.add-product').classList.remove('open');
        showProduct();
        
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        toast({
            title: 'Lỗi',
            message: error.message,
            type: 'error',
            duration: 3000
        });
    }
});

// Hủy tìm kiếm đơn hàng (reset bộ lọc)
async function cancelSearchOrder() {
    try {
        document.getElementById("tinh-trang").value = "2";
        document.getElementById("form-search-order").value = "";
        document.getElementById("time-start").value = "";
        document.getElementById("time-end").value = "";
        await findOrder();
    } catch (error) {
        console.error('Lỗi:', error);
        toast({
            title: "Error",
            message: "Không thể làm mới danh sách đơn hàng",
            type: "error",
            duration: 3000,
        });
    }
}

let thongKeSortMode = null; // null, 'asc', 'desc'

async function loadProductStatistics(sortMode) {
    const category = document.getElementById("the-loai-tk").value;
    const search = document.getElementById("form-search-tk").value;
    const timeStart = document.getElementById("time-start-tk").value;
    const timeEnd = document.getElementById("time-end-tk").value;
    let url = '/api/admin/statistics/products';
    const params = [];
    if (category && category !== "Tất cả") params.push(`category=${encodeURIComponent(category)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (timeStart && timeEnd) params.push(`start=${encodeURIComponent(timeStart)}&end=${encodeURIComponent(timeEnd)}`);
    if (params.length > 0) url += "?" + params.join("&");

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Lỗi khi lấy thống kê sản phẩm');
        let products = await response.json();

        // Sắp xếp theo mode
        if (sortMode === 'asc') {
            products.sort((a, b) => a.total_sold - b.total_sold);
        } else if (sortMode === 'desc') {
            products.sort((a, b) => b.total_sold - a.total_sold);
        }

        // Tính tổng số liệu
        const totalProduct = products.length;
        const totalSold = products.reduce((sum, item) => sum + Number(item.total_sold), 0);
        const totalRevenue = products.reduce((sum, item) => sum + Number(item.total_revenue), 0);

        // Hiển thị lên các thẻ thống kê
        document.getElementById("quantity-product").innerText = totalProduct;
        document.getElementById("quantity-order").innerText = totalSold;
        document.getElementById("quantity-sale").innerText = totalRevenue.toLocaleString('vi-VN') + " đ";

        // Hiển thị bảng chi tiết
        let html = '';
        products.forEach((item, idx) => {
            html += `
                <tr>
                    <td>${idx + 1}</td>
                    <td>
                        <div class="prod-img-title">
                            <img class="prd-img-tbl" src="${item.img}" alt="">
                            <p>${item.title}</p>
                        </div>
                    </td>
                    <td>${item.total_sold}</td>
                    <td>${parseInt(item.total_revenue).toLocaleString('vi-VN')} đ</td>
                </tr>
            `;
        });
        document.getElementById("showTk").innerHTML = html;
    } catch (error) {
        document.getElementById("showTk").innerHTML = '<tr><td colspan="4">Không có dữ liệu</td></tr>';
        document.getElementById("quantity-product").innerText = 0;
        document.getElementById("quantity-order").innerText = 0;
        document.getElementById("quantity-sale").innerText = "0 đ";
    }
}

document.getElementById("the-loai-tk").addEventListener("change", function() { loadProductStatistics(thongKeSortMode); });
document.getElementById("form-search-tk").addEventListener("input", function() { loadProductStatistics(thongKeSortMode); });
document.getElementById("time-start-tk").addEventListener("change", function() { loadProductStatistics(thongKeSortMode); });
document.getElementById("time-end-tk").addEventListener("change", function() { loadProductStatistics(thongKeSortMode); });
window.addEventListener('load', function() { loadProductStatistics(thongKeSortMode); });

function sortThongKe(mode) {
    thongKeSortMode = mode;
    loadProductStatistics(mode);
}

function cancelSearchThongKe() {
    document.getElementById("the-loai-tk").value = "Tất cả";
    document.getElementById("form-search-tk").value = "";
    document.getElementById("time-start-tk").value = "";
    document.getElementById("time-end-tk").value = "";
    thongKeSortMode = null;
    loadProductStatistics();
}
