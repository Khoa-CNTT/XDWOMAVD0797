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
    return price.toLocaleString('vi-VN') + ' đ';
}

// Pagination variables
let perPage = 12;
let currentPage = 1;
let totalPage = 0;
let perProducts = [];

// Load products when page loads
window.addEventListener('load', function() {
    showProduct();
});

// Show Product
async function showProduct() {
    try {
        const selectOp = document.getElementById("the-loai").value;
        const searchInput = document.getElementById("form-search-product").value;
        
        // Gọi API để lấy danh sách sản phẩm
        const response = await fetch(`/api/admin/products?category=${selectOp}&search=${searchInput}`);
        if (!response.ok) {
            throw new Error('Lỗi khi lấy danh sách sản phẩm');
        }
        
        const data = await response.json();
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

// Lắng nghe sự kiện thay đổi của select danh mục
document.getElementById('the-loai').addEventListener('change', function() {
    console.log('Category changed to:', this.value);
    showProduct();
});

function createId(arr) {
  let id = arr.length;
  let check = arr.find((item) => item.id == id);
  while (check != null) {
    id++;
    check = arr.find((item) => item.id == id);
  }
  return id;
}
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

var indexCur;
function editProduct(id) {
  let products = localStorage.getItem("products")
    ? JSON.parse(localStorage.getItem("products"))
    : [];
  let index = products.findIndex((item) => {
    return item.id == id;
  });
  indexCur = index;
  document.querySelectorAll(".add-product-e").forEach((item) => {
    item.style.display = "none";
  });
  document.querySelectorAll(".edit-product-e").forEach((item) => {
    item.style.display = "block";
  });
  document.querySelector(".add-product").classList.add("open");
  //
  document.querySelector(".upload-image-preview").src = products[index].img;
  document.getElementById("ten-mon").value = products[index].title;
  document.getElementById("gia-moi").value = products[index].price;
  document.getElementById("mo-ta").value = products[index].desc;
  document.getElementById("chon-mon").value = products[index].category;
}

function getPathImage(path) {
  let patharr = path.split("/");
  return "./assets/img/products/" + patharr[patharr.length - 1];
}

let btnUpdateProductIn = document.getElementById("update-product-button");
btnUpdateProductIn.addEventListener("click", (e) => {
  e.preventDefault();
  let products = JSON.parse(localStorage.getItem("products"));
  let idProduct = products[indexCur].id;
  let imgProduct = products[indexCur].img;
  let titleProduct = products[indexCur].title;
  let curProduct = products[indexCur].price;
  let descProduct = products[indexCur].desc;
  let categoryProduct = products[indexCur].category;
  let imgProductCur = getPathImage(
    document.querySelector(".upload-image-preview").src
  );
  let titleProductCur = document.getElementById("ten-mon").value;
  let curProductCur = document.getElementById("gia-moi").value;
  let descProductCur = document.getElementById("mo-ta").value;
  let categoryText = document.getElementById("chon-mon").value;

  if (
    imgProductCur != imgProduct ||
    titleProductCur != titleProduct ||
    curProductCur != curProduct ||
    descProductCur != descProduct ||
    categoryText != categoryProduct
  ) {
    let productadd = {
      id: idProduct,
      title: titleProductCur,
      img: imgProductCur,
      category: categoryText,
      price: parseInt(curProductCur),
      desc: descProductCur,
      status: 1,
    };
    products.splice(indexCur, 1);
    products.splice(indexCur, 0, productadd);
    localStorage.setItem("products", JSON.stringify(products));
    toast({
      title: "Success",
      message: "Sửa sản phẩm thành công!",
      type: "success",
      duration: 3000,
    });
    setDefaultValue();
    document.querySelector(".add-product").classList.remove("open");
    showProduct();
  } else {
    toast({
      title: "Warning",
      message: "Sản phẩm của bạn không thay đổi!",
      type: "warning",
      duration: 3000,
    });
  }
});

let btnAddProductIn = document.getElementById("add-product-button");
btnAddProductIn.addEventListener("click", (e) => {
  e.preventDefault();
  let imgProduct = getPathImage(
    document.querySelector(".upload-image-preview").src
  );
  let tenMon = document.getElementById("ten-mon").value.trim();
  let price = document.getElementById("gia-moi").value;
  let moTa = document.getElementById("mo-ta").value.trim();
  let categoryText = document.getElementById("chon-mon").value;

  // Kiểm tra dữ liệu đầu vào
  if (tenMon == "" || price == "" || moTa == "") {
    toast({
      title: "Chú ý",
      message: "Vui lòng nhập đầy đủ thông tin món!",
      type: "warning",
      duration: 3000,
    });
    return;
  }
  if (isNaN(price) || price <= 0) {
    toast({
      title: "Chú ý",
      message: "Giá phải là số lớn hơn 0!",
      type: "warning",
      duration: 3000,
    });
    return;
  }

  // Lấy danh sách sản phẩm hiện tại
  let products = localStorage.getItem("products")
    ? JSON.parse(localStorage.getItem("products"))
    : [];

  // Kiểm tra trùng lặp (title và category giống nhau)
  let isDuplicate = products.some(
    (item) =>
      item.title.toLowerCase() === tenMon.toLowerCase() &&
      item.category === categoryText &&
      item.status == 1 // Chỉ kiểm tra với sản phẩm đang hoạt động
  );

  if (isDuplicate) {
    toast({
      title: "Chú ý",
      message:
        "Sản phẩm này đã tồn tại! Vui lòng kiểm tra lại tên món và danh mục.",
      type: "warning",
      duration: 3000,
    });
    return;
  }

  // Thêm sản phẩm nếu không trùng lặp
  let product = {
    id: createId(products),
    title: tenMon,
    img: imgProduct,
    category: categoryText,
    price: parseInt(price),
    desc: moTa,
    status: 1,
  };
  products.unshift(product);
  localStorage.setItem("products", JSON.stringify(products));
  showProduct();
  document.querySelector(".add-product").classList.remove("open");
  toast({
    title: "Success",
    message: "Thêm sản phẩm thành công!",
    type: "success",
    duration: 3000,
  });
  setDefaultValue();
});

document
  .querySelector(".modal-close.product-form")
  .addEventListener("click", () => {
    setDefaultValue();
  });

function setDefaultValue() {
  document.querySelector(".upload-image-preview").src =
    "./assets/img/blank-image.png";
  document.getElementById("ten-mon").value = "";
  document.getElementById("gia-moi").value = "";
  document.getElementById("mo-ta").value = "";
  document.getElementById("chon-mon").value = "Món chay";
}

// Open Popup Modal
let btnAddProduct = document.getElementById("btn-add-product");
btnAddProduct.addEventListener("click", () => {
  document.querySelectorAll(".add-product-e").forEach((item) => {
    item.style.display = "block";
  });
  document.querySelectorAll(".edit-product-e").forEach((item) => {
    item.style.display = "none";
  });
  document.querySelector(".add-product").classList.add("open");
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
function changeStatus(id, el) {
  let orders = JSON.parse(localStorage.getItem("order"));
  let order = orders.find((item) => {
    return item.id == id;
  });
  order.trangthai = 1;
  el.classList.remove("btn-chuaxuly");
  el.classList.add("btn-daxuly");
  el.innerHTML = "Đã xử lý";
  localStorage.setItem("order", JSON.stringify(orders));
  findOrder(orders);
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
  if (arr.length == 0) {
    orderHtml = `<td colspan="6">Không có dữ liệu</td>`;
  } else {
    arr.forEach((item) => {
      let status =
        item.trangthai == 0
          ? `<span class="status-no-complete">Chưa xử lý</span>`
          : `<span class="status-complete">Đã xử lý</span>`;
      let date = formatDate(item.thoigiandat);
      orderHtml += `
            <tr>
            <td>${item.id}</td>
            <td>${item.khachhang}</td>
            <td>${date}</td>
            <td>${vnd(item.tongtien)}</td>                               
            <td>${status}</td>
            <td class="control">
            <button class="btn-detail" id="" onclick="detailOrder('${
              item.id
            }')"><i class="fa-regular fa-eye"></i> Chi tiết</button>
            </td>
            </tr>      
            `;
    });
  }
  document.getElementById("showOrder").innerHTML = orderHtml;
}

let orders = localStorage.getItem("order")
  ? JSON.parse(localStorage.getItem("order"))
  : [];
window.onload = showOrder(orders);

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
function detailOrder(id) {
  document.querySelector(".modal.detail-order").classList.add("open");
  let orders = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("order"))
    : [];
  let products = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("products"))
    : [];
  // Lấy hóa đơn
  let order = orders.find((item) => item.id == id);
  // Lấy chi tiết hóa đơn
  let ctDon = getOrderDetails(id);
  let spHtml = `<div class="modal-detail-left"><div class="order-item-group">`;

  ctDon.forEach((item) => {
    let detaiSP = products.find((product) => product.id == item.id);
    spHtml += `<div class="order-product">
            <div class="order-product-left">
                <img src="${detaiSP.img}" alt="">
                <div class="order-product-info">
                    <h4>${detaiSP.title}</h4>
                    <p class="order-product-note"><i class="fa-light fa-pen"></i> ${
                      item.note
                    }</p>
                    <p class="order-product-quantity">SL: ${item.soluong}<p>
                </div>
            </div>
            <div class="order-product-right">
                <div class="order-product-price">
                    <span class="order-product-current-price">${vnd(
                      item.price
                    )}</span>
                </div>                         
            </div>
        </div>`;
  });
  spHtml += `</div></div>`;
  spHtml += `<div class="modal-detail-right">
        <ul class="detail-order-group">
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                <span class="detail-order-item-right">${formatDate(
                  order.thoigiandat
                )}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                <span class="detail-order-item-right">${
                  order.hinhthucgiao
                }</span>
            </li>
            <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
            <span class="detail-order-item-right">${order.tenguoinhan}</span>
            </li>
            <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại</span>
            <span class="detail-order-item-right">${order.sdtnhan}</span>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Thời gian giao</span>
                <p class="detail-order-item-b">${
                  (order.thoigiangiao == "" ? "" : order.thoigiangiao + " - ") +
                  formatDate(order.ngaygiaohang)
                }</p>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-location-dot"></i> Địa chỉ nhận</span>
                <p class="detail-order-item-b">${order.diachinhan}</p>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
                <p class="detail-order-item-b">${order.ghichu}</p>
            </li>
        </ul>
    </div>`;
  document.querySelector(".modal-detail-order").innerHTML = spHtml;

  let classDetailBtn = order.trangthai == 0 ? "btn-chuaxuly" : "btn-daxuly";
  let textDetailBtn = order.trangthai == 0 ? "Chưa xử lý" : "Đã xử lý";
  document.querySelector(
    ".modal-detail-bottom"
  ).innerHTML = `<div class="modal-detail-bottom-left">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(order.tongtien)}</span>
        </div>
    </div>
    <div class="modal-detail-bottom-right">
        <button class="modal-detail-btn ${classDetailBtn}" onclick="changeStatus('${
    order.id
  }',this)">${textDetailBtn}</button>
    </div>`;
}

// Find Order
function findOrder() {
  let tinhTrang = parseInt(document.getElementById("tinh-trang").value);
  let ct = document.getElementById("form-search-order").value;
  let timeStart = document.getElementById("time-start").value;
  let timeEnd = document.getElementById("time-end").value;

  if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
    alert("Lựa chọn thời gian sai !");
    return;
  }
  let orders = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("order"))
    : [];
  let result =
    tinhTrang == 2
      ? orders
      : orders.filter((item) => {
          return item.trangthai == tinhTrang;
        });
  result =
    ct == ""
      ? result
      : result.filter((item) => {
          return (
            item.khachhang.toLowerCase().includes(ct.toLowerCase()) ||
            item.id.toString().toLowerCase().includes(ct.toLowerCase())
          );
        });

  if (timeStart != "" && timeEnd == "") {
    result = result.filter((item) => {
      return (
        new Date(item.thoigiandat) >= new Date(timeStart).setHours(0, 0, 0)
      );
    });
  } else if (timeStart == "" && timeEnd != "") {
    result = result.filter((item) => {
      return (
        new Date(item.thoigiandat) <= new Date(timeEnd).setHours(23, 59, 59)
      );
    });
  } else if (timeStart != "" && timeEnd != "") {
    result = result.filter((item) => {
      return (
        new Date(item.thoigiandat) >= new Date(timeStart).setHours(0, 0, 0) &&
        new Date(item.thoigiandat) <= new Date(timeEnd).setHours(23, 59, 59)
      );
    });
  }
  showOrder(result);
}

function cancelSearchOrder() {
  let orders = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("order"))
    : [];
  document.getElementById("tinh-trang").value = 2;
  document.getElementById("form-search-order").value = "";
  document.getElementById("time-start").value = "";
  document.getElementById("time-end").value = "";
  showOrder(orders);
}

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
    obj.category = prod.category;
    obj.title = prod.title;
    obj.img = prod.img;
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

updateAccount.addEventListener("click", (e) => {
  e.preventDefault();
  let accounts = JSON.parse(localStorage.getItem("accounts"));
  let fullname = document.getElementById("fullname").value;
  let phone = document.getElementById("phone").value;
  let password = document.getElementById("password").value;
  if (fullname == "" || phone == "" || password == "") {
    toast({
      title: "Chú ý",
      message: "Vui lòng nhập đầy đủ thông tin !",
      type: "warning",
      duration: 3000,
    });
  } else {
    accounts[indexFlag].fullname = document.getElementById("fullname").value;
    accounts[indexFlag].phone = document.getElementById("phone").value;
    accounts[indexFlag].password = document.getElementById("password").value;
    accounts[indexFlag].status = document.getElementById("user-status").checked
      ? true
      : false;
    localStorage.setItem("accounts", JSON.stringify(accounts));
    toast({
      title: "Thành công",
      message: "Thay đổi thông tin thành công !",
      type: "success",
      duration: 3000,
    });
    document.querySelector(".signup").classList.remove("open");
    signUpFormReset();
    showUser();
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

// Xử lý form thêm sản phẩm
document.getElementById('add-product-button').addEventListener('click', async function(e) {
    e.preventDefault();
    
    // Lấy dữ liệu từ form
    const productData = {
        name: document.getElementById('ten-mon').value.trim(),
        price: parseFloat(document.getElementById('gia-moi').value),
        description: document.getElementById('mo-ta').value.trim(),
        category: document.getElementById('chon-mon').value,
        image: document.querySelector('.upload-image-preview').src,
        status: 1
    };

    // Kiểm tra dữ liệu đầu vào
    if (!productData.name || !productData.price || !productData.category) {
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
        // Gửi request POST đến API để thêm sản phẩm vào database
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Lỗi khi thêm sản phẩm');
        }

        const result = await response.json();
        
        // Hiển thị thông báo thành công
        toast({
            title: 'Thành công',
            message: 'Thêm sản phẩm thành công',
            type: 'success',
            duration: 3000
        });

        // Đóng modal và làm mới danh sách sản phẩm
        document.querySelector('.modal.add-product').classList.remove('open');
        showProduct();
        
        // Reset form
        document.querySelector('.add-product-form').reset();
        document.querySelector('.upload-image-preview').src = './assets/img/blank-image.png';
        
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        toast({
            title: 'Lỗi',
            message: error.message,
            type: 'error',
            duration: 3000
        });
    }
});

// Xử lý form cập nhật sản phẩm
document.getElementById('update-product-button').addEventListener('click', async function(e) {
    e.preventDefault();
    
    const form = document.querySelector('.add-product-form');
    const productId = form.dataset.productId;
    
    // Lấy dữ liệu từ form
    const productData = {
        name: document.getElementById('ten-mon').value.trim(),
        price: parseFloat(document.getElementById('gia-moi').value),
        description: document.getElementById('mo-ta').value.trim(),
        category: document.getElementById('chon-mon').value,
        image: document.querySelector('.upload-image-preview').src
    };

    // Kiểm tra dữ liệu đầu vào
    if (!productData.name || !productData.price || !productData.category) {
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
