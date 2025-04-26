// Doi sang dinh dang tien VND
function vnd(price) {
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

// Close popup
const body = document.querySelector("body");
let modalContainer = document.querySelectorAll(".modal");
let modalBox = document.querySelectorAll(".mdl-cnt");
let formLogSign = document.querySelector(".forms");

// Click vùng ngoài sẽ tắt Popup
modalContainer.forEach((item) => {
  item.addEventListener("click", closeModal);
});

modalBox.forEach((item) => {
  item.addEventListener("click", function (event) {
    event.stopPropagation();
  });
});

function closeModal() {
  modalContainer.forEach((item) => {
    item.classList.remove("open");
  });
  console.log(modalContainer);
  body.style.overflow = "auto";
}

function increasingNumber(e) {
  let qty = e.parentNode.querySelector(".input-qty");
  if (parseInt(qty.value) < qty.max) {
    qty.value = parseInt(qty.value) + 1;
  } else {
    qty.value = qty.max;
  }
}

function decreasingNumber(e) {
  let qty = e.parentNode.querySelector(".input-qty");
  if (qty.value > qty.min) {
    qty.value = parseInt(qty.value) - 1;
  } else {
    qty.value = qty.min;
  }
}
//slide banner
document.addEventListener('DOMContentLoaded', function() {
  const sliderContainer = document.querySelector('.slider-container');
  const slides = document.querySelectorAll('.home-slider img');
  const dotsContainer = document.querySelector('.slider-dots');
  let currentSlide = 0;
  let slideInterval;
  const slideDuration = 10000; // 5 giây
  
  slides.forEach((slide, index) => {
    const dot = document.createElement('div');
    dot.classList.add('slider-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
    dotsContainer.appendChild(dot);
  });
  
  const dots = document.querySelectorAll('.slider-dot');
  
  function goToSlide(index) {
    currentSlide = index;
    updateSlider();
    resetInterval();
  }
  
  function updateSlider() {
    sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
  }
  
  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, slideDuration);
  }
  slideInterval = setInterval(nextSlide, slideDuration);
  sliderContainer.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
  });
  sliderContainer.addEventListener('mouseleave', resetInterval);
});

//Xem chi tiet san pham
async function detailProduct(index, event) {
  let modal = document.querySelector(".modal.product-detail");
  if (!modal) {
    console.error("Product detail modal not found");
    return;
  }
  
  try {
    // Gọi API để lấy thông tin sản phẩm
    console.log('Calling API for product ID:', index);
    const response = await fetch(`/api/products/${index}`);
    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Không thể lấy thông tin sản phẩm');
    }
    
    // Kiểm tra xem dữ liệu có tồn tại không
    if (!data) {
      console.error("Product not found:", index);
      toast({
        title: "Error",
        message: `Không tìm thấy sản phẩm có ID: ${index}`,
        type: "error",
        duration: 3000,
      });
      return;
    }

    const infoProduct = data;
    console.log('Product info:', infoProduct);
    
    if (event) {
      event.preventDefault();
    }

    // Tạo nội dung modal
    let modalHtml = `<div class="modal-header">
      <img class="product-image" src="${infoProduct.img}" alt="${infoProduct.title}">
    </div>
    <div class="modal-body">
        <h2 class="product-title">${infoProduct.title}</h2>
        <div class="product-control">
            <div class="priceBox">
                <span class="current-price">${vnd(infoProduct.price)}</span>
            </div>
            <div class="buttons_added">
                <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                <input class="input-qty" max="100" min="1" name="" type="number" value="1">
                <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
            </div>
        </div>
        <p class="product-description">${infoProduct.description || ''}</p>
    </div>
    <div class="notebox">
            <p class="notebox-title">Ghi chú</p>
            <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
    </div>
    <div class="modal-footer">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(infoProduct.price)}</span>
        </div>
        <div class="modal-footer-control">
            <button class="button-dathangngay" data-product="${infoProduct.id}">Đặt hàng ngay</button>
            <button class="button-dat" id="add-cart" onclick="animationCart()"><i class="fa-light fa-basket-shopping"></i></button>
        </div>
    </div>`;

    // Hiển thị modal
    let modalContent = document.querySelector("#product-detail-content");
    if (!modalContent) {
      console.error("Product detail content element not found");
      return;
    }
    
    modalContent.innerHTML = modalHtml;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    // Update price when quantity changes
    let tgbtn = document.querySelectorAll(".is-form");
    let qty = document.querySelector(".product-control .input-qty");
    let priceText = document.querySelector(".price");
    tgbtn.forEach((element) => {
      element.addEventListener("click", () => {
        let price = infoProduct.price * parseInt(qty.value);
        priceText.innerHTML = vnd(price);
      });
    });

    // Add product to cart
    let productbtn = document.querySelector(".button-dat");
    productbtn.addEventListener("click", (e) => {
      if (localStorage.getItem("currentuser")) {
        addCart(infoProduct.id);
      } else {
        toast({
          title: "Warning",
          message: "Chưa đăng nhập tài khoản !",
          type: "warning",
          duration: 3000,
        });
      }
    });

    // Buy product immediately
    // dathangngay();
  } catch (error) {
    console.error('Error in detailProduct:', error);
    toast({
      title: "Error",
      message: "Lỗi khi tải thông tin sản phẩm: " + error.message,
      type: "error",
      duration: 3000,
    });
  }
}

function animationCart() {
  document.querySelector(".count-product-cart").style.animation =
    "slidein ease 1s";
  setTimeout(() => {
    document.querySelector(".count-product-cart").style.animation = "none";
  }, 1000);
}

// Them SP vao gio hang
function addCart(index) {
  let currentuser = localStorage.getItem("currentuser")
    ? JSON.parse(localStorage.getItem("currentuser"))
    : [];
  let soluong = document.querySelector(".input-qty").value;
  let popupDetailNote = document.querySelector("#popup-detail-note").value;
  let note = popupDetailNote == "" ? "Không có ghi chú" : popupDetailNote;
  let productcart = {
    id: index,
    soluong: parseInt(soluong),
    note: note,
  };
  let vitri = currentuser.cart.findIndex((item) => item.id == productcart.id);
  if (vitri == -1) {
    currentuser.cart.push(productcart);
  } else {
    currentuser.cart[vitri].soluong =
      parseInt(currentuser.cart[vitri].soluong) + parseInt(productcart.soluong);
  }
  localStorage.setItem("currentuser", JSON.stringify(currentuser));
  updateAmount();
  closeModal();
  // toast({ title: 'Success', message: 'Thêm thành công sản phẩm vào giỏ hàng', type: 'success', duration: 3000 });
}

//Show gio hang
async function showCart() {
  if (localStorage.getItem("currentuser") != null) {
    let currentuser = JSON.parse(localStorage.getItem("currentuser"));
    if (currentuser.cart.length != 0) {
      document.querySelector(".gio-hang-trong").style.display = "none";
      document.querySelector("button.thanh-toan").classList.remove("disabled");
      let productcarthtml = "";
      
      // Sử dụng Promise.all để đợi tất cả các sản phẩm được tải
      const products = await Promise.all(currentuser.cart.map(async (item) => {
        const product = await getProduct(item);
        return {
          ...product,
          soluong: item.soluong,
          note: item.note
        };
      }));
      
      products.forEach((product) => {
        productcarthtml += `<li class="cart-item" data-id="${product.id}">
          <div class="cart-item-info">
            <img src="${product.img}" alt="${product.title}" class="cart-item-img">
            <div class="cart-item-details">
              <p class="cart-item-title">${product.title}</p>
              <span class="cart-item-price price" data-price="${product.price}">
                ${vnd(parseInt(product.price))}
              </span>
            </div>
          </div>
          <p class="product-note"><i class="fa-light fa-pencil"></i><span>${product.note}</span></p>
          <div class="cart-item-control">
            <button class="cart-item-delete" onclick="deleteCartItem(${product.id},this)">Xóa</button>
            <div class="buttons_added">
              <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
              <input class="input-qty" max="100" min="1" name="" type="number" value="${product.soluong}">
              <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
            </div>
          </div>
        </li>`;
      });
      
      document.querySelector(".cart-list").innerHTML = productcarthtml;
      updateCartTotal();
      saveAmountCart();
    } else {
      document.querySelector(".gio-hang-trong").style.display = "flex";
    }
  }
  let modalCart = document.querySelector(".modal-cart");
  let containerCart = document.querySelector(".cart-container");
  let themmon = document.querySelector(".them-mon");
  modalCart.onclick = function () {
    closeCart();
  };
  themmon.onclick = function () {
    closeCart();
  };
  containerCart.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

// Delete cart item
function deleteCartItem(id, el) {
  let cartParent = el.parentNode.parentNode;
  cartParent.remove();
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  let vitri = currentUser.cart.findIndex((item) => (item.id = id));
  currentUser.cart.splice(vitri, 1);

  // Nếu trống thì hiển thị giỏ hàng trống
  if (currentUser.cart.length == 0) {
    document.querySelector(".gio-hang-trong").style.display = "flex";
    document.querySelector("button.thanh-toan").classList.add("disabled");
  }
  localStorage.setItem("currentuser", JSON.stringify(currentUser));
  updateCartTotal();
}

//Update cart total
async function updateCartTotal() {
  const total = await getCartTotal();
  document.querySelector(".text-price").innerText = vnd(total);
}

// Lay tong tien don hang
async function getCartTotal() {
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  let tongtien = 0;
  if (currentUser != null) {
    // Sử dụng Promise.all để đợi tất cả các sản phẩm được tải
    const products = await Promise.all(currentUser.cart.map(async (item) => {
      const product = await getProduct(item);
      return {
        ...product,
        soluong: item.soluong
      };
    }));
    
    products.forEach((product) => {
      tongtien += parseInt(product.soluong) * parseInt(product.price);
    });
  }
  return tongtien;
}

// Get Product
async function getProduct(item) {
  try {
    // Gọi API để lấy thông tin sản phẩm
    const response = await fetch(`/api/products/${item.id}`);
    if (!response.ok) {
      throw new Error('Không thể lấy thông tin sản phẩm');
    }
    
    const data = await response.json();
    if (!data) {
      console.error('Product not found:', item.id);
      return {
        id: item.id,
        title: 'Sản phẩm không tồn tại',
        price: 0,
        soluong: item.soluong || 0,
        note: item.note || 'Không có ghi chú'
      };
    }
    
    return {
      ...data,
      soluong: item.soluong || 0,
      note: item.note || 'Không có ghi chú'
    };
  } catch (error) {
    console.error('Error in getProduct:', error);
    return {
      id: item.id,
      title: 'Lỗi tải sản phẩm',
      price: 0,
      soluong: item.soluong || 0,
      note: item.note || 'Không có ghi chú'
    };
  }
}

window.onload = updateAmount();
window.onload = updateCartTotal();

// Lay so luong hang

function getAmountCart() {
  let currentuser = JSON.parse(localStorage.getItem("currentuser"));
  let amount = 0;
  currentuser.cart.forEach((element) => {
    amount += parseInt(element.soluong);
  });
  return amount;
}

//Update Amount Cart
function updateAmount() {
  if (localStorage.getItem("currentuser") != null) {
    let amount = getAmountCart();
    document.querySelector(".count-product-cart").innerText = amount;
  }
}

// Save Cart Info
function saveAmountCart() {
  let cartAmountbtn = document.querySelectorAll(".cart-item-control .is-form");
  let listProduct = document.querySelectorAll(".cart-item");
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  cartAmountbtn.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      let id = listProduct[parseInt(index / 2)].getAttribute("data-id");
      let productId = currentUser.cart.find((item) => {
        return item.id == id;
      });
      productId.soluong = parseInt(
        listProduct[parseInt(index / 2)].querySelector(".input-qty").value
      );
      localStorage.setItem("currentuser", JSON.stringify(currentUser));
      updateCartTotal();
    });
  });
}

// Open & Close Cart
function openCart() {
  showCart();
  document.querySelector(".modal-cart").classList.add("open");
  body.style.overflow = "hidden";
}

function closeCart() {
  document.querySelector(".modal-cart").classList.remove("open");
  body.style.overflow = "auto";
  updateAmount();
}

// Open Search Advanced
document.querySelector(".filter-btn").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector(".advanced-search").classList.toggle("open");
  document.getElementById("home-service").scrollIntoView();
});

document.querySelector(".form-search-input").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("home-service").scrollIntoView();
});

function closeSearchAdvanced() {
  document.querySelector(".advanced-search").classList.toggle("open");
}

//Open Search Mobile
function openSearchMb() {
  document.querySelector(".header-middle-left").style.display = "none";
  document.querySelector(".header-middle-center").style.display = "block";
  document.querySelector(".header-middle-right-item.close").style.display =
    "block";
  let liItem = document.querySelectorAll(".header-middle-right-item.open");
  for (let i = 0; i < liItem.length; i++) {
    liItem[i].style.setProperty("display", "none", "important");
  }
}

//Close Search Mobile
function closeSearchMb() {
  document.querySelector(".header-middle-left").style.display = "block";
  document.querySelector(".header-middle-center").style.display = "none";
  document.querySelector(".header-middle-right-item.close").style.display =
    "none";
  let liItem = document.querySelectorAll(".header-middle-right-item.open");
  for (let i = 0; i < liItem.length; i++) {
    liItem[i].style.setProperty("display", "block", "important");
  }
}

//Signup && Login Form

// Chuyen doi qua lai SignUp & Login
let signup = document.querySelector(".signup-link");
let login = document.querySelector(".login-link");
let container = document.querySelector(".signup-login .modal-container");
login.addEventListener("click", () => {
  container.classList.add("active");
});

signup.addEventListener("click", () => {
  container.classList.remove("active");
});

let signupbtn = document.getElementById("signup");
let loginbtn = document.getElementById("login");
let formsg = document.querySelector(".modal.signup-login");
signupbtn.addEventListener("click", () => {
  formsg.classList.add("open");
  container.classList.remove("active");
  body.style.overflow = "hidden";
});

loginbtn.addEventListener("click", () => {
  document.querySelector(".form-message-check-login").innerHTML = "";
  formsg.classList.add("open");
  container.classList.add("active");
  body.style.overflow = "hidden";
});

// Dang nhap & Dang ky

// Chức năng đăng ký
let signupButton = document.getElementById("signup-button");
signupButton.addEventListener("click", async (event) => {
    event.preventDefault();
    let fullNameUser = document.getElementById("fullname").value;
    let phoneUser = document.getElementById("phone").value;
    let passwordUser = document.getElementById("password").value;
    let passwordConfirmation = document.getElementById("password_confirmation").value;
    let checkSignup = document.getElementById("checkbox-signup").checked;
    let isValid = true;

    // Check validate
    if (fullNameUser.length == 0) {
        document.querySelector(".form-message-name").innerHTML = "Vui lòng nhập họ và tên";
        document.getElementById("fullname").focus();
        isValid = false;
    } else if (fullNameUser.length < 3) {
        document.getElementById("fullname").value = "";
        document.querySelector(".form-message-name").innerHTML = "Vui lòng nhập họ và tên lớn hơn 3 kí tự";
        isValid = false;
    } else {
        document.querySelector(".form-message-name").innerHTML = "";
    }

    if (phoneUser.length == 0) {
        document.querySelector(".form-message-phone").innerHTML = "Vui lòng nhập vào số điện thoại";
        isValid = false;
    } else if (!/^\d+$/.test(phoneUser)) {
        document.querySelector(".form-message-phone").innerHTML = "Chỉ được nhập số, không được nhập chữ";
        document.getElementById("phone").value = "";
        isValid = false;
    } else if (phoneUser.length != 10) {
        document.querySelector(".form-message-phone").innerHTML = "Vui lòng nhập vào số điện thoại 10 số";
        document.getElementById("phone").value = "";
        isValid = false;
    } else {
        document.querySelector(".form-message-phone").innerHTML = "";
    }

    if (passwordUser.length == 0) {
        document.querySelector(".form-message-password").innerHTML = "Vui lòng nhập mật khẩu";
        isValid = false;
    } else if (passwordUser.length < 6) {
        document.querySelector(".form-message-password").innerHTML = "Vui lòng nhập mật khẩu lớn hơn 6 kí tự";
        document.getElementById("password").value = "";
        isValid = false;
    } else {
        document.querySelector(".form-message-password").innerHTML = "";
    }

    if (passwordConfirmation.length == 0) {
        document.querySelector(".form-message-password-confi").innerHTML = "Vui lòng nhập lại mật khẩu";
        isValid = false;
    } else if (passwordConfirmation !== passwordUser) {
        document.querySelector(".form-message-password-confi").innerHTML = "Mật khẩu không khớp";
        document.getElementById("password_confirmation").value = "";
        isValid = false;
    } else {
        document.querySelector(".form-message-password-confi").innerHTML = "";
    }

    if (!checkSignup) {
        document.querySelector(".form-message-checkbox").innerHTML = "Vui lòng check đăng ký";
        isValid = false;
    } else {
        document.querySelector(".form-message-checkbox").innerHTML = "";
    }

    if (isValid) {
        try {
            const response = await fetch('/api/auth/register', {
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
                throw new Error(data.error || 'Lỗi đăng ký');
            }

            // Lưu thông tin user vào localStorage
            localStorage.setItem("currentuser", JSON.stringify(data.user));
            
            toast({
                title: "Thành công",
                message: "Tạo thành công tài khoản !",
                type: "success",
                duration: 3000,
            });
            
            closeModal();
            kiemtradangnhap();
            updateAmount();
            
        } catch (error) {
            toast({
                title: "Thất bại",
                message: error.message,
                type: "error",
                duration: 3000,
            });
        }
    }
});

// Đăng nhập
let loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", async (event) => {
    event.preventDefault();
    let phonelog = document.getElementById("phone-login").value;
    let passlog = document.getElementById("password-login").value;
    let isValid = true;

    if (phonelog.length == 0) {
        document.querySelector(".form-message.phonelog").innerHTML = "Vui lòng nhập vào số điện thoại";
        isValid = false;
    } else if (!/^\d+$/.test(phonelog)) {
        document.querySelector(".form-message.phonelog").innerHTML = "Chỉ được nhập số, không được nhập chữ";
        document.getElementById("phone-login").value = "";
        isValid = false;
    } else if (phonelog.length != 10) {
        document.querySelector(".form-message.phonelog").innerHTML = "Vui lòng nhập vào số điện thoại 10 số";
        document.getElementById("phone-login").value = "";
        isValid = false;
    } else {
        document.querySelector(".form-message.phonelog").innerHTML = "";
    }

    if (passlog.length == 0) {
        document.querySelector(".form-message-check-login").innerHTML = "Vui lòng nhập mật khẩu";
        isValid = false;
    } else if (passlog.length < 6) {
        document.querySelector(".form-message-check-login").innerHTML = "Vui lòng nhập mật khẩu lớn hơn 6 kí tự";
        document.getElementById("password-login").value = "";
        isValid = false;
    } else {
        document.querySelector(".form-message-check-login").innerHTML = "";
    }

    if (isValid) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: phonelog,
                    password: passlog
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Lỗi đăng nhập');
            }

            // Lưu thông tin user vào localStorage
            localStorage.setItem("currentuser", JSON.stringify(data.user));
            
            toast({
                title: "Success",
                message: "Đăng nhập thành công",
                type: "success",
                duration: 3000,
            });
            
            closeModal();
            kiemtradangnhap();
            checkAdmin();
            updateAmount();
            
        } catch (error) {
            toast({
                title: "Thất bại",
                message: error.message,
                type: "error",
                duration: 3000,
            });
        }
    }
});

// Kiểm tra xem có tài khoản đăng nhập không ?
function kiemtradangnhap() {
  let currentUser = localStorage.getItem("currentuser");
  if (currentUser != null) {
    let user = JSON.parse(currentUser);
    document.querySelector(
      ".auth-container"
    ).innerHTML = `<span class="text-dndk">Tài khoản</span>
            <span class="text-tk">${user.fullname} <i class="fa-sharp fa-solid fa-caret-down"></span>`;
    document.querySelector(
      ".header-middle-right-menu"
    ).innerHTML = `<li><a href="javascript:;" onclick="myAccount()"><i class="fa-light fa-circle-user"></i> Tài khoản của tôi</a></li>
            <li><a href="javascript:;" onclick="orderHistory()"><i class="fa-regular fa-bags-shopping"></i> Đơn hàng đã mua</a></li>
            <li class="border"><a id="logout" href="javascript:;"><i class="fa-light fa-right-from-bracket"></i> Thoát tài khoản</a></li>`;
    document.querySelector("#logout").addEventListener("click", logOut);
  }
}

function logOut() {
  // Hiển thị hộp thoại xác nhận
  if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
    let accounts = localStorage.getItem("accounts")
      ? JSON.parse(localStorage.getItem("accounts"))
      : [];
    let user = localStorage.getItem("currentuser")
      ? JSON.parse(localStorage.getItem("currentuser"))
      : null;

    if (user) {
      let vitri = accounts.findIndex((item) => item.phone == user.phone);
      if (vitri !== -1) {
        accounts[vitri].cart = [...user.cart];
        localStorage.setItem("accounts", JSON.stringify(accounts));
      }
    }

    localStorage.removeItem("currentuser");
    window.location.href = "/";
  }
}

function checkAdmin() {
  let user = JSON.parse(localStorage.getItem("currentuser"));
  if (user && user.user_type == 1) {
    // Kiểm tra xem menu đã tồn tại chưa
    let existingMenu = document.querySelector(".header-middle-right-menu li a[href='./admin.html']");
    if (!existingMenu) {
      let node = document.createElement(`li`);
      node.innerHTML = `<a href="./admin.html"><i class="fa-light fa-store"></i> Quản lý cửa hàng</a>`;
      document.querySelector(".header-middle-right-menu").prepend(node);
    }
  }
}

window.onload = kiemtradangnhap();
window.onload = checkAdmin();

// Chuyển đổi trang chủ và trang thông tin tài khoản
function myAccount() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("trangchu").classList.add("hide");
  document.getElementById("order-history").classList.remove("open");
  document.getElementById("account-user").classList.add("open");
  userInfo();
}

// Chuyển đổi trang chủ và trang xem lịch sử đặt hàng
function orderHistory() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("account-user").classList.remove("open");
  document.getElementById("trangchu").classList.add("hide");
  document.getElementById("order-history").classList.add("open");
  renderOrderProduct();
}

function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function userInfo() {
  let user = JSON.parse(localStorage.getItem("currentuser"));
  document.getElementById("infoname").value = user.fullname;
  document.getElementById("infophone").value = user.phone;
  document.getElementById("infoemail").value = user.email;
  document.getElementById("infoaddress").value = user.address;
  if (user.email == undefined) {
    infoemail.value = "";
  }
  if (user.address == undefined) {
    infoaddress.value = "";
  }
}

// Thay doi thong tin
function changeInformation() {
  let accounts = JSON.parse(localStorage.getItem("accounts"));
  let user = JSON.parse(localStorage.getItem("currentuser"));
  let infoname = document.getElementById("infoname");
  let infoemail = document.getElementById("infoemail");
  let infoaddress = document.getElementById("infoaddress");

  user.fullname = infoname.value;
  if (infoemail.value.length > 0) {
    if (!emailIsValid(infoemail.value)) {
      document.querySelector(".inforemail-error").innerHTML =
        "Vui lòng nhập lại email!";
      infoemail.value = "";
    } else {
      user.email = infoemail.value;
    }
  }

  if (infoaddress.value.length > 0) {
    user.address = infoaddress.value;
  }

  let vitri = accounts.findIndex((item) => item.phone == user.phone);

  accounts[vitri].fullname = user.fullname;
  accounts[vitri].email = user.email;
  accounts[vitri].address = user.address;
  localStorage.setItem("currentuser", JSON.stringify(user));
  localStorage.setItem("accounts", JSON.stringify(accounts));
  kiemtradangnhap();
  toast({
    title: "Success",
    message: "Cập nhật thông tin thành công !",
    type: "success",
    duration: 3000,
  });
}

// Đổi mật khẩu
function changePassword() {
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  let passwordCur = document.getElementById("password-cur-info");
  let passwordAfter = document.getElementById("password-after-info");
  let passwordConfirm = document.getElementById("password-comfirm-info");
  let check = true;
  if (passwordCur.value.length == 0) {
    document.querySelector(".password-cur-info-error").innerHTML =
      "Vui lòng nhập mật khẩu hiện tại";
    check = false;
  } else {
    document.querySelector(".password-cur-info-error").innerHTML = "";
  }

  if (passwordAfter.value.length == 0) {
    document.querySelector(".password-after-info-error").innerHTML =
      "Vui lòn nhập mật khẩu mới";
    check = false;
  } else {
    document.querySelector(".password-after-info-error").innerHTML = "";
  }

  if (passwordConfirm.value.length == 0) {
    document.querySelector(".password-after-comfirm-error").innerHTML =
      "Vui lòng nhập mật khẩu xác nhận";
    check = false;
  } else {
    document.querySelector(".password-after-comfirm-error").innerHTML = "";
  }

  if (check == true) {
    if (passwordCur.value.length > 0) {
      if (passwordCur.value == currentUser.password) {
        document.querySelector(".password-cur-info-error").innerHTML = "";
        if (passwordAfter.value.length > 0) {
          if (passwordAfter.value.length < 6) {
            document.querySelector(".password-after-info-error").innerHTML =
              "Vui lòng nhập mật khẩu mới có số  kí tự lớn hơn bằng 6";
          } else {
            document.querySelector(".password-after-info-error").innerHTML = "";
            if (passwordConfirm.value.length > 0) {
              if (passwordConfirm.value == passwordAfter.value) {
                document.querySelector(
                  ".password-after-comfirm-error"
                ).innerHTML = "";
                currentUser.password = passwordAfter.value;
                localStorage.setItem(
                  "currentuser",
                  JSON.stringify(currentUser)
                );
                let userChange = JSON.parse(
                  localStorage.getItem("currentuser")
                );
                let accounts = JSON.parse(localStorage.getItem("accounts"));
                let accountChange = accounts.find((acc) => {
                  return (acc.phone = userChange.phone);
                });
                accountChange.password = userChange.password;
                localStorage.setItem("accounts", JSON.stringify(accounts));
                toast({
                  title: "Success",
                  message: "Đổi mật khẩu thành công !",
                  type: "success",
                  duration: 3000,
                });
              } else {
                document.querySelector(
                  ".password-after-comfirm-error"
                ).innerHTML = "Mật khẩu bạn nhập không trùng khớp";
              }
            } else {
              document.querySelector(
                ".password-after-comfirm-error"
              ).innerHTML = "Vui lòng xác nhận mật khẩu";
            }
          }
        } else {
          document.querySelector(".password-after-info-error").innerHTML =
            "Vui lòng nhập mật khẩu mới";
        }
      } else {
        document.querySelector(".password-cur-info-error").innerHTML =
          "Bạn đã nhập sai mật khẩu hiện tại";
      }
    }
  }
}

function getProductInfo(id) {
  let products = JSON.parse(localStorage.getItem("products"));
  return products.find((item) => {
    return item.id == id;
  });
}

// Quan ly don hang
function renderOrderProduct() {
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  let order = localStorage.getItem("order")
    ? JSON.parse(localStorage.getItem("order"))
    : [];
  let orderHtml = "";
  let arrDonHang = [];
  for (let i = 0; i < order.length; i++) {
    if (order[i].khachhang === currentUser.phone) {
      arrDonHang.push(order[i]);
    }
  }
  if (arrDonHang.length == 0) {
    orderHtml = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>Chưa có đơn hàng nào</p></div>`;
  } else {
    arrDonHang.forEach((item) => {
      let productHtml = `<div class="order-history-group">`;
      let chiTietDon = getOrderDetails(item.id);
      chiTietDon.forEach((sp) => {
        let infosp = getProductInfo(sp.id);
        productHtml += `<div class="order-history">
                    <div class="order-history-left">
                        <img src="${infosp.img}" alt="">
                        <div class="order-history-info">
                            <h4>${infosp.title}!</h4>
                            <p class="order-history-note"><i class="fa-light fa-pen"></i> ${
                              sp.note
                            }</p>
                            <p class="order-history-quantity">x${sp.soluong}</p>
                        </div>
                    </div>
                    <div class="order-history-right">
                        <div class="order-history-price">
                            <span class="order-history-current-price">${vnd(
                              sp.price
                            )}</span>
                        </div>                         
                    </div>
                </div>`;
      });
      let textCompl = item.trangthai == 1 ? "Đã xử lý" : "Đang xử lý";
      let classCompl = item.trangthai == 1 ? "complete" : "no-complete";
      productHtml += `<div class="order-history-control">
                <div class="order-history-status">
                    <span class="order-history-status-sp ${classCompl}">${textCompl}</span>
                    <button id="order-history-detail" onclick="detailOrder('${
                      item.id
                    }')"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                </div>
                <div class="order-history-total">
                    <span class="order-history-total-desc">Tổng tiền: </span>
                    <span class="order-history-toltal-price">${vnd(
                      item.tongtien
                    )}</span>
                </div>
            </div>`;
      productHtml += `</div>`;
      orderHtml += productHtml;
    });
  }
  document.querySelector(".order-history-section").innerHTML = orderHtml;
}

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

// Xem chi tiet don hang
function detailOrder(id) {
  let order = JSON.parse(localStorage.getItem("order"));
  let detail = order.find((item) => {
    return item.id == id;
  });
  document.querySelector(".modal.detail-order").classList.add("open");
  let detailOrderHtml = `<ul class="detail-order-group">
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
            <span class="detail-order-item-right">${formatDate(
              detail.thoigiandat
            )}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
            <span class="detail-order-item-right">${detail.hinhthucgiao}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Ngày nhận hàng</span>
            <span class="detail-order-item-right">${
              (detail.thoigiangiao == "" ? "" : detail.thoigiangiao + " - ") +
              formatDate(detail.ngaygiaohang)
            }</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Địa điểm nhận</span>
            <span class="detail-order-item-right">${detail.diachinhan}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
            <span class="detail-order-item-right">${detail.tenguoinhan}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại nhận</span>
            <span class="detail-order-item-right">${detail.sdtnhan}</span>
        </li>
    </ul>`;
  document.querySelector(".detail-order-content").innerHTML = detailOrderHtml;
}

// Create id order
function createId(arr) {
  let id = arr.length + 1;
  let check = arr.find((item) => item.id == "DH" + id);
  while (check != null) {
    id++;
    check = arr.find((item) => item.id == "DH" + id);
  }
  return "DH" + id;
}

// Back to top
window.onscroll = () => {
  let backtopTop = document.querySelector(".back-to-top");
  if (document.documentElement.scrollTop > 100) {
    backtopTop.classList.add("active");
  } else {
    backtopTop.classList.remove("active");
  }
};

// Auto hide header on scroll
const headerNav = document.querySelector(".header-bottom");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  if (lastScrollY < window.scrollY) {
    headerNav.classList.add("hide");
  } else {
    headerNav.classList.remove("hide");
  }
  lastScrollY = window.scrollY;
});

// Page
function renderProducts(showProduct) {
    let productHtml = "";
    if (showProduct.length == 0) {
        document.getElementById("home-title").style.display = "none";
        productHtml = `<div class="no-result"><div class="no-result-h">Tìm kiếm không có kết quả</div><div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được kết quả hợp với tìm kiếm của bạn</div><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div></div>`;
    } else {
        document.getElementById("home-title").style.display = "block";
        showProduct.forEach((product) => {
            productHtml += `<div class="col-product">
                <article class="card-product" >
                    <div class="card-header">
                        <a href="#" class="card-image-link" onclick="event.preventDefault(); detailProduct(${product.id}, event)">
                        <img class="card-image" src="${product.img}" alt="${product.title}">
                        </a>
                    </div>
                    <div class="food-info">
                        <div class="card-content">
                            <div class="card-title">
                                <a href="#" class="card-title-link" onclick="event.preventDefault(); detailProduct(${product.id}, event)">${product.title}</a>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="product-price">
                                <span class="current-price">${vnd(product.price)}</span>
                            </div>
                        <div class="product-buy">
                            <button onclick="event.preventDefault(); detailProduct(${product.id}, event)" class="card-button order-item"><i class="fa-regular fa-cart-shopping-fast"></i> Đặt món</button>
                        </div> 
                    </div>
                    </div>
                </article>
            </div>`;
        });
    }
    document.getElementById("home-products").innerHTML = productHtml;
}

// Biến lưu trữ danh sách sản phẩm
let productAll = [];

// Lấy dữ liệu từ API khi trang web được tải
window.onload = function() {
    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            productAll = products.filter(item => item.status == 1);
            showHomeProduct(productAll);
        })
        .catch(error => console.error('Lỗi khi lấy dữ liệu:', error));
};

// Find Product
function searchProducts(mode) {
    let valeSearchInput = document.querySelector(".form-search-input").value;
    let valueCategory = document.getElementById("advanced-search-category-select").value;
    let minPrice = document.getElementById("min-price").value;
    let maxPrice = document.getElementById("max-price").value;

    if (parseInt(minPrice) > parseInt(maxPrice) && minPrice != "" && maxPrice != "") {
        alert("Giá đã nhập sai !");
        return;
    }

    // Lọc theo danh mục
    let result = valueCategory == "Tất cả" 
        ? productAll 
        : productAll.filter(item => item.category_name == valueCategory);

    // Lọc theo từ khóa tìm kiếm
    result = valeSearchInput == "" 
        ? result 
        : result.filter(item => item.title.toString().toUpperCase().includes(valeSearchInput.toString().toUpperCase()));

    // Lọc theo giá
    if (minPrice == "" && maxPrice != "") {
        result = result.filter(item => item.price <= maxPrice);
    } else if (minPrice != "" && maxPrice == "") {
        result = result.filter(item => item.price >= minPrice);
    } else if (minPrice != "" && maxPrice != "") {
        result = result.filter(item => item.price <= maxPrice && item.price >= minPrice);
    }

    switch (mode) {
        case 0:
            // Reset tìm kiếm
            fetch('/api/products')
                .then(response => response.json())
                .then(products => {
                    result = products;
                    document.querySelector(".form-search-input").value = "";
                    document.getElementById("advanced-search-category-select").value = "Tất cả";
                    document.getElementById("min-price").value = "";
                    document.getElementById("max-price").value = "";
                    showHomeProduct(result);
                });
            break;
        case 1:
            result.sort((a, b) => a.price - b.price);
            showHomeProduct(result);
            break;
        case 2:
            result.sort((a, b) => b.price - a.price);
            showHomeProduct(result);
            break;
        default:
            showHomeProduct(result);
    }
}

// Phân trang
let perPage = 12;
let currentPage = 1;
let totalPage = 0;
let perProducts = [];

function displayList(productAll, perPage, currentPage) {
    let start = (currentPage - 1) * perPage;
    let end = (currentPage - 1) * perPage + perPage;
    let productShow = productAll.slice(start, end);
    renderProducts(productShow);
}

function showHomeProduct(products) {
    // Lấy danh sách danh mục duy nhất từ sản phẩm
    const categories = [...new Set(products.map(p => p.category_name))].filter(Boolean);
    
    // Cập nhật select danh mục
    const categorySelect = document.getElementById("advanced-search-category-select");
    categorySelect.innerHTML = '<option value="Tất cả">Tất cả</option>';
    categories.forEach(category => {
        categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
    });
    
    // Hiển thị sản phẩm PHÂN TRANG
    currentPage = 1; // Luôn về trang 1 khi load mới
    displayList(products, perPage, currentPage);
    setupPagination(products, perPage);
}

function setupPagination(productAll, perPage) {
    const pageNavList = document.querySelector(".page-nav-list");
    pageNavList.innerHTML = "";

    let page_count = Math.ceil(productAll.length / perPage);
    if (page_count <= 1) return; // Không cần phân trang nếu chỉ có 1 trang

    // Nút "Trang trước"
    let prevLi = document.createElement("li");
    prevLi.className = "page-nav-item prev";
    prevLi.innerHTML = `<a href="javascript:;">&laquo;</a>`;
    prevLi.onclick = function () {
        if (currentPage > 1) {
            currentPage--;
            displayList(productAll, perPage, currentPage);
            setupPagination(productAll, perPage);
            scrollToProducts();
        }
    };
    pageNavList.appendChild(prevLi);

    // Hiển thị tối đa 5 số trang quanh trang hiện tại
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(page_count, currentPage + 2);

    if (startPage > 1) {
        let firstLi = document.createElement("li");
        firstLi.className = "page-nav-item";
        firstLi.innerHTML = `<a href="javascript:;">1</a>`;
        firstLi.onclick = function () {
            currentPage = 1;
            displayList(productAll, perPage, currentPage);
            setupPagination(productAll, perPage);
            scrollToProducts();
        };
        pageNavList.appendChild(firstLi);

        if (startPage > 2) {
            let dots = document.createElement("li");
            dots.className = "page-nav-item dots";
            dots.innerHTML = `<span>...</span>`;
            pageNavList.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        let li = document.createElement("li");
        li.className = "page-nav-item";
        if (currentPage == i) li.classList.add("active");
        li.innerHTML = `<a href="javascript:;">${i}</a>`;
        li.onclick = function () {
            currentPage = i;
            displayList(productAll, perPage, currentPage);
            setupPagination(productAll, perPage);
            scrollToProducts();
        };
        pageNavList.appendChild(li);
    }

    if (endPage < page_count) {
        if (endPage < page_count - 1) {
            let dots = document.createElement("li");
            dots.className = "page-nav-item dots";
            dots.innerHTML = `<span>...</span>`;
            pageNavList.appendChild(dots);
        }
        let lastLi = document.createElement("li");
        lastLi.className = "page-nav-item";
        lastLi.innerHTML = `<a href="javascript:;">${page_count}</a>`;
        lastLi.onclick = function () {
            currentPage = page_count;
            displayList(productAll, perPage, currentPage);
            setupPagination(productAll, perPage);
            scrollToProducts();
        };
        pageNavList.appendChild(lastLi);
    }

    // Nút "Trang sau"
    let nextLi = document.createElement("li");
    nextLi.className = "page-nav-item next";
    nextLi.innerHTML = `<a href="javascript:;">&raquo;</a>`;
    nextLi.onclick = function () {
        if (currentPage < page_count) {
            currentPage++;
            displayList(productAll, perPage, currentPage);
            setupPagination(productAll, perPage);
            scrollToProducts();
        }
    };
    pageNavList.appendChild(nextLi);
}

// Cuộn lên đầu danh sách sản phẩm khi đổi trang
function scrollToProducts() {
    document.getElementById("home-products").scrollIntoView({ behavior: "smooth" });
}

// Đặt hàng ngay
function dathangngay() {
    let currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if (!currentUser) {
        toast({
            title: "Warning",
            message: "Vui lòng đăng nhập để đặt hàng!",
            type: "warning",
            duration: 3000,
        });
        return;
    }

    let soluong = document.querySelector(".input-qty").value;
    let popupDetailNote = document.querySelector("#popup-detail-note").value;
    let note = popupDetailNote == "" ? "Không có ghi chú" : popupDetailNote;
    let productId = document.querySelector(".button-dathangngay").getAttribute("data-product");
    let price = document.querySelector(".price").textContent.replace(/[^0-9]/g, "");

    // Tạo đơn hàng mới
    let order = {
        id: createId(JSON.parse(localStorage.getItem("order") || "[]")),
        khachhang: currentUser.phone,
        tongtien: parseInt(price) * parseInt(soluong),
        trangthai: 0,
        thoigiandat: new Date().toISOString(),
        hinhthucgiao: "Giao hàng tận nơi",
        thoigiangiao: "",
        ngaygiaohang: new Date().toISOString(),
        diachinhan: currentUser.address || "",
        tenguoinhan: currentUser.fullname,
        sdtnhan: currentUser.phone
    };

    // Lưu đơn hàng
    let orders = JSON.parse(localStorage.getItem("order") || "[]");
    orders.push(order);
    localStorage.setItem("order", JSON.stringify(orders));

    // Lưu chi tiết đơn hàng
    let orderDetails = JSON.parse(localStorage.getItem("orderDetails") || "[]");
    orderDetails.push({
        madon: order.id,
        id: productId,
        soluong: parseInt(soluong),
        price: parseInt(price),
        note: note
    });
    localStorage.setItem("orderDetails", JSON.stringify(orderDetails));

    // Xóa sản phẩm khỏi giỏ hàng nếu có
    if (currentUser.cart) {
        currentUser.cart = currentUser.cart.filter(item => item.id != productId);
        localStorage.setItem("currentuser", JSON.stringify(currentUser));
    }

    toast({
        title: "Success",
        message: "Đặt hàng thành công!",
        type: "success",
        duration: 3000,
    });

    closeModal();
    updateAmount();
}

// Forgot Password Functions
function openForgotPassword() {
    document.querySelector(".modal.forgot-password").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeForgotPassword() {
    document.querySelector(".modal.forgot-password").classList.remove("open");
    document.body.style.overflow = "auto";
}

// Handle forgot password form submission
const forgotPasswordBtn = document.getElementById("forgot-password-button");
if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", async function(e) {
        e.preventDefault();
        const phone = document.getElementById("phone-forgot").value;
        const messageElement = document.querySelector(".form-message-phone-forgot");
        
        // Validate phone number
        if (!phone) {
            messageElement.textContent = "Vui lòng nhập số điện thoại";
            return;
        }
        
        if (phone.length != 10) {
            messageElement.textContent = "Vui lòng nhập số điện thoại 10 số";
            return;
        }
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Lỗi khi đặt lại mật khẩu');
            }
            
            // Show success message
            toast({
                title: "Thành công",
                message: "Mật khẩu mới đã được gửi đến số điện thoại của bạn",
                type: "success",
                duration: 3000,
            });
            
            // Close modal
            closeForgotPassword();
            
        } catch (error) {
            console.error('Lỗi:', error);
            messageElement.textContent = error.message;
        }
    });
}

// Hiển thị sản phẩm theo danh mục
async function showCategory(category) {
    try {
        // Gọi API lấy sản phẩm theo danh mục
        const res = await fetch(`/api/admin/products?category=${encodeURIComponent(category)}`);
        const data = await res.json();
        if (res.ok) {
            // Hiển thị danh sách sản phẩm ra trang chủ
            showHomeProduct(data.products); // Hàm này sẽ render sản phẩm ra #home-products
        } else {
            showToast(data.error || 'Không lấy được danh sách món ăn!');
        }
    } catch (err) {
        showToast('Lỗi kết nối server!');
    }
}
