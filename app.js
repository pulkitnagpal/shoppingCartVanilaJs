const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

let cart = [];
let buttonsDOM = [];

// getting the products
class Products {
  async getProducts() {
    try {
      const response = await fetch("./products.json").then((res) => res.json());
      let productsArr = response.items.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, id, image, price };
      });
      return productsArr;
    } catch (err) {
      console.log(err);
    }
  }
}
// ui
class UI {
  displayProducts(products) {
    console.log("products", products);
    let results = ``;
    products.forEach((product) => {
      results += `
      <article class="product">
        <div class="img-container">
          <img src= "${product.image}" alt="product" srcset="" class="product-img"/>
          <button class="bag-btn" data-id="${product.id}">
            Add To Cart
            <i class="fas fa-shopping-cart"></i>
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>${product.price}</h4>
      </article>
      `;
    });
    productsDOM.innerHTML = results;
  }
  getAddCartBtns() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = btns;
    btns.forEach((btn) => {
      let id = btn.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // get product
        const cartItem = { ...Storage.getProduct(id), amount: 1 };
        cart = [...cart, cartItem];
        Storage.saveCart(cart);

        // set cart values
        this.setCartValues(cart);

        // display cart items
        this.addCartItem(cartItem);
        // show the cart

        this.showCart();
        console.log(cart);
      });
    });
  }

  setCartValues(cart) {
    let { sum, numOfItems } = cart.reduce(
      (acc, item) => ({
        sum: acc.sum + item.price * item.amount,
        numOfItems: acc.numOfItems + item.amount,
      }),
      {
        sum: 0,
        numOfItems: 0,
      }
    );
    console.log("sum", sum, "numOfItems", numOfItems);
    cartTotal.innerHTML = sum;
    cartItems.innerText = numOfItems;
  }

  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
        <img src="${cartItem.image}" alt="product" srcset="">
          <div>
            <h4>${cartItem.title}</h4>
            <h5>${cartItem.price}</h5>
            <span class="remove-item" data-id="${cartItem.id}">Remove</span>
          </div>
          <div>
            <i class="fas fa-chevron-up" data-id="${cartItem.id}"></i>
            <p class="item-amount">${cartItem.amount}</p>
            <i class="fas fa-chevron-down" data-id="${cartItem.id}"></i>
          </div>
      `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart")
  }

  hideCart() {
    cartDOM.classList.remove("showCart");
    cartOverlay.classList.remove("transparentBcg");
  }

  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItem(item);
    })
  }
  // resetBagButtons() {
  //   buttonsDOM.forEach((btnDOM) => {
  //     btnDOM.innerText = "Add To Cart";
  //     btnDOM.disabled = false;
  //   })
  // }
  // deleteAllCartItems() {
  //   const cartItems = [...document.querySelectorAll(".cart-item")];
  //   cartItems.forEach((cartItem) => {
  //     cartItem.parentNode.removeChild(cartItem);
  //   })  
  // }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    button.disabled = false;
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));

    // while (cartContent.children.length > 0) {
    //   cartContent.removeChild(cartContent.children[0]);
    // }
    cartContent.innerHTML = "";
  }
  cartLogic() {
    clearCartBtn.addEventListener('click', () => this.clearCart());

    // cart functionality
    cartContent.addEventListener('click', event => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        const id = removeItem.dataset.id;
        this.removeItem(id);
        let closestCartItem = event.target.closest(".cart-item");
        cartContent.removeChild(closestCartItem);
      }

    })
  }

  setupApp() {
    cartBtn.addEventListener('click', () => this.showCart())

    closeCartBtn.addEventListener('click', this.hideCart)
    // pull cart data from local storage
    const prevCart = Storage.getCartItems() || [];
    // update the cart values total items and sum
    cart = prevCart;
    this.setCartValues(cart);
    // add cart items to the cart window
    this.populateCart(cart);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const products = JSON.parse(localStorage.getItem("products"));
    return products.find((p) => p.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCartItems() {
    return JSON.parse(localStorage.getItem("cart"))
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setupApp();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getAddCartBtns();
      ui.cartLogic();
    });
  // cartBtn.addEventListener('click', () => {
  //   cartDOM.classList.add("showCart");
  //   cartOverlay.classList.add("transparentBcg");
  // })

  // closeCartBtn.addEventListener('click', () => {
  //   cartDOM.classList.remove("showCart");
  //   cartOverlay.classList.remove("transparentBcg");
  // })
});
