// Doi sang dinh dang tien VND
function vnd(price) {
  return parseInt(price).toLocaleString("vi-VN") + " đ";
}

// Close popup
const body = document.querySelector("body");
let modalContainer = document.querySelectorAll(".modal");
let modalBox = document.querySelectorAll(".mdl-cnt");
let formLogSign = document.querySelector(".forms");
let checkoutpage = document.querySelector(".checkout-page");

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
    </div>
    <div class="product-reviews"></div>`;

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
    let dathangngayBtn = document.querySelector(".button-dathangngay");
    dathangngayBtn.addEventListener("click", () => {
      if (localStorage.getItem("currentuser")) {
        let soluong = document.querySelector(".input-qty").value;
        let popupDetailNote = document.querySelector("#popup-detail-note").value;
        let note = popupDetailNote == "" ? "Không có ghi chú" : popupDetailNote;
        let product = {
          id: infoProduct.id,
          title: infoProduct.title,
          price: infoProduct.price,
          soluong: parseInt(soluong),
          note: note
        };
        checkoutpage.classList.add('active');
        thanhtoanpage(2, product);
        closeModal();
        body.style.overflow = "hidden";
      } else {
        toast({
          title: "Warning",
          message: "Chưa đăng nhập tài khoản !",
          type: "warning",
          duration: 3000,
        });
      }
    });

    // Thêm phần đánh giá
    const user = JSON.parse(localStorage.getItem("currentuser"));
    if (user) {
      const hasPurchased = await hasUserPurchasedProduct(user.id, infoProduct.id);
      const hasReviewed = await hasUserReviewedProduct(user.id, infoProduct.id);
      
      if (hasPurchased && !hasReviewed) {
        const reviewForm = showReviewForm(infoProduct.id);
        const reviewSection = document.querySelector('.product-reviews');
        if (reviewSection) {
          reviewSection.appendChild(reviewForm);
        }
      }
    }
    
    // Tải danh sách đánh giá
    loadProductReviews(infoProduct.id);

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
      let nutthanhtoan = document.querySelector('.thanh-toan');
      nutthanhtoan.classList.remove("disabled");
      nutthanhtoan.removeAttribute("disabled");
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
      let nutthanhtoan = document.querySelector('.thanh-toan');
      nutthanhtoan.classList.add("disabled");
      nutthanhtoan.setAttribute("disabled", true);
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
  // Gán lại sự kiện cho nút thanh toán
  let nutthanhtoan = document.querySelector('.thanh-toan');
  let checkoutpage = document.querySelector('.checkout-page');
  nutthanhtoan.onclick = function() {
    if (!nutthanhtoan.classList.contains('disabled')) {
      checkoutpage.classList.add('active');
      thanhtoanpage(1);
      closeCart();
      body.style.overflow = "hidden";
    }
  }
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
    let nutthanhtoan = document.querySelector('.thanh-toan');
    nutthanhtoan.classList.add("disabled");
    nutthanhtoan.setAttribute("disabled", true);
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
  // Ẩn chatbot khi mở giỏ hàng
  var chatContainer = document.getElementById('chat-container');
  if (chatContainer) {
    chatContainer.style.display = 'none';
    isChatOpen = false;
  }
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
  // Ẩn các phần không liên quan
  var hideSelectors = [
    '.home-slider',
    '.home-service',
    '.home-title-block',
    '.home-products',
    '.page-nav',
    '#trangchu',
    '#order-history' // Ẩn luôn phần đơn hàng
  ];
  hideSelectors.forEach(function(sel) {
    var el = document.querySelector(sel);
    if (el) el.style.display = 'none';
  });
  // Hiện form tài khoản
  var acc = document.getElementById("account-user");
  if (acc) {
    acc.classList.add("open");
    acc.style.display = "flex";
  }
  // Ẩn phần đơn hàng nếu có
  var order = document.getElementById("order-history");
  if (order) {
    order.classList.remove("open");
    order.style.display = "none";
  }
  // Hiện lại các trường tài khoản
  var changePass = document.querySelector('.change-password');
  if (changePass) changePass.style.display = '';
  var btnSavePass = document.getElementById('save-password');
  if (btnSavePass) btnSavePass.style.display = '';
  userInfo();
}

function orderHistory() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  // Ẩn các phần không liên quan
  var hideSelectors = [
    '.home-slider',
    '.home-service',
    '.home-title-block',
    '.home-products',
    '.page-nav',
    '#trangchu',
    '#account-user' // Ẩn luôn phần tài khoản
  ];
  hideSelectors.forEach(function(sel) {
    var el = document.querySelector(sel);
    if (el) el.style.display = 'none';
  });
  // Hiện phần đơn hàng
  var order = document.getElementById("order-history");
  if (order) {
    order.classList.add("open");
    order.style.display = "flex";
    order.style.justifyContent = "center";
  }
  // Ẩn phần tài khoản nếu có
  var acc = document.getElementById("account-user");
  if (acc) {
    acc.classList.remove("open");
    acc.style.display = "none";
  }
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
async function changeInformation() {
  let user = JSON.parse(localStorage.getItem("currentuser"));
  let infoname = document.getElementById("infoname").value;
  let infoemail = document.getElementById("infoemail").value;
  let infoaddress = document.getElementById("infoaddress").value;

  // Validate như cũ...
  if (infoemail.length > 0 && !emailIsValid(infoemail)) {
    document.querySelector(".inforemail-error").innerHTML = "Vui lòng nhập lại email!";
    document.getElementById("infoemail").value = "";
    return;
  }

  try {
    const response = await fetch('/api/auth/update-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: user.phone,
        fullname: infoname,
        email: infoemail,
        address: infoaddress
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Lỗi cập nhật thông tin");

    // Cập nhật lại localStorage nếu muốn đồng bộ giao diện
    user.fullname = infoname;
    user.email = infoemail;
    user.address = infoaddress;
    localStorage.setItem("currentuser", JSON.stringify(user));

    toast({
      title: "Success",
      message: "Cập nhật thông tin thành công!",
      type: "success",
      duration: 3000,
    });
    kiemtradangnhap();
  } catch (error) {
    toast({
      title: "Lỗi",
      message: error.message,
      type: "error",
      duration: 3000,
    });
  }
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
async function renderOrderProduct() {
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  if (!currentUser) return;
  let orderHtml = "";
  // Lấy đơn hàng từ database qua API
  try {
    const response = await fetch(`/api/orders/user/${currentUser.id}`);
    const orders = await response.json();
    if (!orders.length) {
      orderHtml = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>Chưa có đơn hàng nào</p></div>`;
    } else {
      // Gom nhóm đơn hàng theo mã đơn (nếu API trả về dạng flat)
      // Nếu API trả về mỗi đơn là 1 object có mảng chi tiết thì chỉ cần lặp
      // Giả sử API trả về mỗi đơn có mảng order_details
      orders.forEach((item) => {
        let productHtml = `<div class="order-history-group">`;
        // Nếu item.order_details là mảng chi tiết sản phẩm
        (item.order_details || []).forEach((sp) => {
          productHtml += `<div class="order-history">
                    <div class="order-history-left">
                        <img src="${sp.img || './assets/img/no-image.png'}" alt="">
                        <div class="order-history-info">
                            <h4>${sp.title || 'Sản phẩm'}</h4>
                            <p class="order-history-note"><i class="fa-light fa-pen"></i> ${sp.note || ''}</p>
                            <p class="order-history-quantity">x${sp.quantity || sp.soluong || 0}</p>
                        </div>
                    </div>
                    <div class="order-history-right">
                        <div class="order-history-price">
                            <span class="order-history-current-price">${vnd(sp.price || 0)}</span>
                        </div>                         
                    </div>
                </div>`;
        });
        let textCompl = item.status == 1 ? "Đã xử lý" : "Đang xử lý";
        let classCompl = item.status == 1 ? "complete" : "no-complete";
        productHtml += `<div class="order-history-control">
                <div class="order-history-status">
                    <span class="order-history-status-sp ${classCompl}">${textCompl}</span>
                    <button id="order-history-detail" onclick="detailOrder('${item.id}')"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                </div>
                <div class="order-history-total">
                    <span class="order-history-total-desc">Tổng tiền: </span>
                    <span class="order-history-toltal-price">${vnd(item.total_amount || item.tongtien || 0)}</span>
                </div>
            </div>`;
        productHtml += `</div>`;
        orderHtml += productHtml;
      });
    }
  } catch (e) {
    orderHtml = `<div class='empty-order-section'><p>Lỗi tải đơn hàng!</p></div>`;
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
async function detailOrder(id) {
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  if (!currentUser) return;
  // Lấy lại danh sách đơn hàng từ API
  const response = await fetch(`/api/orders/user/${currentUser.id}`);
  const orders = await response.json();
  const detail = orders.find((item) => item.id == id);
  if (!detail) {
    alert("Không tìm thấy đơn hàng!");
    return;
  }
  document.querySelector(".modal.detail-order").classList.add("open");
  let detailOrderHtml = `<ul class="detail-order-group">
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
            <span class="detail-order-item-right">${formatDate(detail.created_at)}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
            <span class="detail-order-item-right">${detail.delivery_type || ""}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Ngày nhận hàng</span>
            <span class="detail-order-item-right">${formatDate(detail.delivery_date)}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Địa điểm nhận</span>
            <span class="detail-order-item-right">${detail.shipping_address || ""}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
            <span class="detail-order-item-right">${detail.receiver_name || ""}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại nhận</span>
            <span class="detail-order-item-right">${detail.receiver_phone || ""}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
            <span class="detail-order-item-right">${detail.note || ""}</span>
        </li>
    </ul>`;

  // Hiển thị danh sách món đã mua và form đánh giá cho từng món
  if (detail.order_details && Array.isArray(detail.order_details)) {
    detailOrderHtml += `<div class="order-products-review-list">`;
    for (const sp of detail.order_details) {
      detailOrderHtml += `
        <div class="order-product-review-item" id="order-product-review-${sp.id}">
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${sp.img || './assets/img/no-image.png'}" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
            <div>
              <h4 style="margin:0;">${sp.title || 'Sản phẩm'}</h4>
              <p style="margin:0;">Số lượng: x${sp.quantity || sp.soluong || 0}</p>
            </div>
          </div>
          <div class="review-form-container"></div>
          <div class="other-reviews-container"></div>
        </div>
      `;
    }
    detailOrderHtml += `</div>`;
  }
  document.querySelector(".detail-order-content").innerHTML = detailOrderHtml;

  // Gán sự kiện cho từng món để hiện form hoặc đánh giá của mình và các đánh giá khác
  for (const sp of detail.order_details) {
    const container = document.querySelector(`#order-product-review-${sp.id} .review-form-container`);
    const otherContainer = document.querySelector(`#order-product-review-${sp.id} .other-reviews-container`);
    // Lấy danh sách đánh giá sản phẩm này
    const reviews = await fetch(`/api/reviews?product_id=${sp.id}`).then(res => res.json());
    const myReview = reviews.find(r => r.user_id == currentUser.id);
    if (myReview) {
      // Hiện đánh giá của mình
      container.innerHTML = `<div class='my-review'><b>Đánh giá của bạn:</b><br>
        <span style='color:#ffd700'>${'★'.repeat(myReview.rating)}${'☆'.repeat(5-myReview.rating)}</span><br>
        <span>${myReview.comment}</span>
      </div>`;
    } else {
      // Hiện form đánh giá
      container.appendChild(showReviewForm(sp.id));
    }
    // Hiện các đánh giá khác (nếu có)
    const otherReviews = reviews.filter(r => r.user_id != currentUser.id);
    if (otherReviews.length > 0) {
      otherContainer.innerHTML = `<div class='other-reviews'><b>Các đánh giá khác:</b><br>
        ${otherReviews.map(r => `
          <div class='review-item'>
            <span class='review-user'>${r.user_name || 'Người dùng'}</span>:
            <span style='color:#ffd700'>${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span><br>
            <span>${r.comment}</span>
          </div>
        `).join('')}
      </div>`;
    } else {
      otherContainer.innerHTML = '';
    }
  }
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

    // Log dữ liệu sản phẩm ban đầu
    if (valeSearchInput.toLowerCase().includes('bánh')) {
        console.log('--- KIỂM TRA TỰ ĐỘNG ---');
        console.log('productAll:', productAll.map(p => ({title: p.title, category: p.category_name, status: p.status})));
    }

    if (parseInt(minPrice) > parseInt(maxPrice) && minPrice != "" && maxPrice != "") {
        alert("Giá đã nhập sai !");
        return;
    }

    // Lọc theo danh mục
    let result = valueCategory == "Tất cả" 
        ? productAll 
        : productAll.filter(item => item.category_name == valueCategory);

    // Lọc theo từ khóa tìm kiếm - cải thiện tìm kiếm
    if (valeSearchInput != "") {
        const searchTerm = valeSearchInput.toLowerCase().trim();
        result = result.filter(item => {
            const title = item.title.toLowerCase();
            const category = (item.category_name || '').toLowerCase();
            return title.includes(searchTerm) || category.includes(searchTerm);
        });
        // Log kết quả lọc nếu tìm "bánh"
        if (searchTerm.includes('bánh')) {
            console.log('Kết quả sau lọc từ khóa:', result.map(p => ({title: p.title, category: p.category_name})));
        }
    }

    // Lọc theo giá
    if (minPrice == "" && maxPrice != "") {
        result = result.filter(item => item.price <= maxPrice);
    } else if (minPrice != "" && maxPrice == "") {
        result = result.filter(item => item.price >= minPrice);
    } else if (minPrice != "" && maxPrice != "") {
        result = result.filter(item => item.price <= maxPrice && item.price >= minPrice);
    }

    // Hiển thị kết quả
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

    // Hiển thị thông báo nếu không có kết quả
    if (result.length === 0) {
        document.getElementById("home-title").style.display = "none";
        document.getElementById("home-products").innerHTML = `
            <div class="no-result">
                <div class="no-result-h">Không tìm thấy kết quả</div>
                <div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được sản phẩm phù hợp với từ khóa "${valeSearchInput}"</div>
                <div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div>
            </div>`;
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

// Add event listener for "Đặt hàng ngay" button
document.addEventListener('DOMContentLoaded', function() {
    const dathangngayBtn = document.querySelector('.button-dathangngay');
    if (dathangngayBtn) {
        dathangngayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            dathangngay();
        });
    }
});

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

// Hiển thị form đánh giá
function showReviewForm(productId) {
    const reviewForm = document.createElement('div');
    reviewForm.className = 'review-form';
    reviewForm.innerHTML = `
        <h3>Đánh giá sản phẩm</h3>
        <div class="rating">
            <span class="star" data-rating="1">★</span>
            <span class="star" data-rating="2">★</span>
            <span class="star" data-rating="3">★</span>
            <span class="star" data-rating="4">★</span>
            <span class="star" data-rating="5">★</span>
        </div>
        <textarea id="reviewComment" placeholder="Nhập đánh giá của bạn..."></textarea>
        <button onclick="submitReview(${productId})">Gửi đánh giá</button>
    `;
    
    const stars = reviewForm.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.dataset.rating;
            reviewForm.dataset.rating = rating;
            stars.forEach(s => {
                if (parseInt(s.dataset.rating) <= parseInt(rating)) {
                    s.classList.add('active');
                    s.style.color = '#ffd700';
                } else {
                    s.classList.remove('active');
                    s.style.color = '#ccc';
                }
            });
        });
    });
    // Ngăn không cho nhập số vào textarea khi chưa focus
    const textarea = reviewForm.querySelector('#reviewComment');
    reviewForm.addEventListener('keydown', function(e) {
        if (document.activeElement !== textarea && e.key >= '0' && e.key <= '9') {
            e.preventDefault();
        }
    });
    return reviewForm;
}

async function hasUserPurchasedProduct(userId, productId) {
    // Tạm thời cho phép đánh giá mọi sản phẩm để test giao diện
    return true;
}

async function hasUserReviewedProduct(userId, productId) {
    try {
        const response = await fetch(`/api/reviews?product_id=${productId}`);
        const reviews = await response.json();
        return reviews.some(r => r.user_id == userId);
    } catch (error) {
        console.error('Error checking review history:', error);
        return false;
    }
}

async function submitReview(productId) {
    const user = JSON.parse(localStorage.getItem("currentuser"));
    if (!user) {
        toast({
            title: "Thông báo",
            message: "Vui lòng đăng nhập để đánh giá",
            type: "warning",
            duration: 3000,
        });
        return;
    }

    // Không kiểm tra đã mua để test giao diện
    // const hasPurchased = await hasUserPurchasedProduct(user.id, productId);
    // if (!hasPurchased) { ... }

    // Kiểm tra xem người dùng đã đánh giá chưa
    const hasReviewed = await hasUserReviewedProduct(user.id, productId);
    if (hasReviewed) {
        toast({
            title: "Thông báo",
            message: "Bạn đã đánh giá sản phẩm này rồi",
            type: "warning",
            duration: 3000,
        });
        return;
    }
    
    const reviewForm = document.querySelector('.review-form');
    const rating = reviewForm.dataset.rating;
    const comment = document.getElementById('reviewComment').value;
    console.log('DEBUG rating khi gửi:', rating);
    
    if (!rating) {
        toast({
            title: "Thông báo",
            message: "Vui lòng chọn số sao",
            type: "warning",
            duration: 3000,
        });
        return;
    }
    
    try {
        const payload = {
                user_id: user.id,
                product_id: productId,
                rating: parseInt(rating),
                comment: comment
        };
        console.log('DEBUG gửi đánh giá:', payload);
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        console.log('DEBUG response:', response);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
            console.log('DEBUG data:', data);
        if (response.ok) {
                toast({
                    title: "Thành công",
                    message: "Cảm ơn bạn đã đánh giá!",
                    type: "success",
                    duration: 3000,
                });
            loadProductReviews(productId);
                // Ẩn form đánh giá sau khi gửi thành công
                const reviewForm = document.querySelector('.review-form');
                if (reviewForm) {
                    reviewForm.remove();
                }
        } else {
                toast({
                    title: "Lỗi",
                    message: data.error || 'Có lỗi xảy ra khi gửi đánh giá',
                    type: "error",
                    duration: 3000,
                });
            }
        } else {
            const text = await response.text();
            console.log('DEBUG response text:', text);
            toast({
                title: "Lỗi",
                message: "API không trả về JSON hợp lệ!",
                type: "error",
                duration: 3000,
            });
        }
    } catch (error) {
        console.error('Lỗi khi gửi đánh giá:', error);
        toast({
            title: "Lỗi",
            message: "Có lỗi xảy ra khi gửi đánh giá",
            type: "error",
            duration: 3000,
        });
    }
}

async function loadProductReviews(productId) {
    try {
        const response = await fetch(`/api/reviews?product_id=${productId}`);
        const data = await response.json();
        
        const reviewsContainer = document.querySelector('.product-reviews');
        if (!reviewsContainer) return;

        // Tính điểm trung bình
        const averageRating = data.length > 0 
            ? (data.reduce((sum, review) => sum + review.rating, 0) / data.length).toFixed(1)
            : 0;
        
        reviewsContainer.innerHTML = `
            <div class="reviews-summary">
            <h3>Đánh giá sản phẩm</h3>
                <div class="average-rating">
                    <span class="rating-number">${averageRating}</span>
                    <div class="rating-stars">
                        ${'★'.repeat(Math.round(averageRating))}${'☆'.repeat(5-Math.round(averageRating))}
                    </div>
                    <span class="rating-count">${data.length} đánh giá</span>
                </div>
            </div>
            <div class="reviews-list">
                ${data.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <span class="review-user">${review.user_name}</span>
                            <span class="review-rating">
                                ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                            </span>
                        </div>
                        <div class="review-comment">${review.comment}</div>
                        <div class="review-date">${new Date(review.created_at).toLocaleDateString()}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Lỗi khi tải đánh giá:', error);
    }
}

// Thêm CSS cho phần đánh giá
const style = document.createElement('style');
style.textContent = `
    .product-reviews {
        margin-top: 20px;
        padding: 20px;
        border-top: 1px solid #eee;
    }

    .review-form {
        margin: 20px 0;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f9f9f9;
    }
    
    .review-form h3 {
        margin-bottom: 15px;
        color: #333;
        font-size: 18px;
    }
    
    .rating {
        margin: 10px 0;
        display: flex;
        gap: 5px;
    }
    
    .star {
        font-size: 30px;
        color: #ccc;
        cursor: pointer;
        transition: color 0.2s;
    }
    
    .star:hover,
    .star.active {
        color: #ffd700;
    }
    
    #reviewComment {
        width: 100%;
        min-height: 100px;
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: vertical;
    }

    .review-form button {
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s;
    }

    .review-form button:hover {
        background-color: #45a049;
    }
    
    .reviews-summary {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 8px;
    }
    
    .reviews-summary h3 {
        margin-bottom: 10px;
        color: #333;
        font-size: 18px;
    }
    
    .average-rating {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
    }
    
    .rating-number {
        font-size: 24px;
        font-weight: bold;
        color: #333;
    }
    
    .rating-stars {
        color: #ffd700;
        font-size: 20px;
    }
    
    .rating-count {
        color: #666;
        font-size: 14px;
    }
    
    .reviews-list {
        margin-top: 20px;
    }
    
    .review-item {
        margin: 15px 0;
        padding: 15px;
        border-bottom: 1px solid #eee;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .review-user {
        font-weight: bold;
        color: #333;
    }
    
    .review-rating {
        color: #ffd700;
    }
    
    .review-comment {
        margin: 10px 0;
        color: #444;
        line-height: 1.5;
    }
    
    .review-date {
        color: #666;
        font-size: 0.9em;
    }

    .modal-body {
        max-height: 60vh;
        overflow-y: auto;
    }
`;
document.head.appendChild(style);

// Thêm form đánh giá vào trang chi tiết sản phẩm
function showProductDetail(productId) {
    // ... existing product detail code ...
    // Thêm phần đánh giá
    const productDetail = document.querySelector('.product-detail');
    if (productDetail) {
        const reviewSection = document.createElement('div');
        reviewSection.className = 'product-reviews';
        productDetail.appendChild(reviewSection);
        // Chỉ tải danh sách đánh giá, không render form
        loadProductReviews(productId);
    }
}

// Close Page Checkout
function closecheckout() {
    checkoutpage.classList.remove('active');
    body.style.overflow = "auto";
}

