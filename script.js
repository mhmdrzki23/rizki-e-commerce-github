/* script.js
   Single-page e-commerce demo
   Cart stored in-memory (no localStorage)
*/

const products = [
  { id: 'p1', title: 'Sepatu Sneakers', price: 275000, img: 'sepatu seneakers.png', desc: 'Sepatu nyaman untuk daily use. Bahan breathable, sol anti slip.' },
  { id: 'p2', title: 'Jaket Boys', price: 210000, img: 'jaket w.webp', desc: 'Ringan, tahan angin dan mudah dilipat. Cocok buat traveling.' },
  { id: 'p3', title: 'Tas Ransel 20L', price: 145000, img: 'tas ransel.webp', desc: 'Kapasitas ideal, banyak sekat. Bahan water-resistant.' },
  { id: 'p4', title: 'TWS MP3', price: 320000, img: 'TWS-JETE.jpg', desc: 'Suara jernih, baterai awet sampai 20 jam.' },
  { id: 'p5', title: 'Iphone 17', price: 25000000, img: 'iphone-17.jpg', desc: 'Desain modern, nyaman dipakai sepanjang hari.' }
];

let cart = []; // in-memory cart

// UTIL
const rupiah = (n) => 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// DOM nodes
const productsGrid = document.getElementById('products-grid');
const cartCount = document.getElementById('cart-count');
const cartArea = document.getElementById('cart-area');
const checkoutShortcut = document.getElementById('checkout-shortcut');
const checkoutSection = document.getElementById('checkout');
const checkoutItems = document.getElementById('checkout-items');
const checkoutTotal = document.getElementById('checkout-total');
const checkoutForm = document.getElementById('checkout-form');
const yearSpan = document.getElementById('year');
const waLink = document.getElementById('wa-link');
const productModal = document.getElementById('product-modal');
const modalClose = document.getElementById('modal-close');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalQty = document.getElementById('modal-qty');
const modalAdd = document.getElementById('modal-add');
const searchInput = document.getElementById('search-input');

yearSpan.textContent = new Date().getFullYear();

// Nav behavior (single page routing)
document.querySelectorAll('.nav-btn, .primary-btn[data-section]').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    const section = btn.dataset.section;
    if(section) showSection(section);
  });
});
document.querySelectorAll('[data-section]').forEach(b=>b.addEventListener('click', (e)=>{
  if(e.currentTarget.dataset.section) showSection(e.currentTarget.dataset.section);
}));

function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  if(id === 'cart') renderCart();
  if(id === 'checkout') renderCheckout();
}

// PRODUCTS render
function renderProducts(filter = '') {
  productsGrid.innerHTML = '';
  const list = products.filter(p => p.title.toLowerCase().includes(filter.toLowerCase()));
  if(list.length === 0){
    productsGrid.innerHTML = '<p class="muted">Produk tidak ditemukan.</p>';
    return;
  }
  list.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}" loading="lazy"/>
      <div class="meta">
        <h4>${p.title}</h4>
        <div class="price">${rupiah(p.price)}</div>
      </div>
      <p class="muted" style="font-size:13px">${p.desc}</p>
      <div style="display:flex;gap:8px;margin-top:auto">
        <button class="ghost-btn view-btn" data-id="${p.id}">Detail</button>
        <button class="primary-btn add-btn" data-id="${p.id}">Tambah</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });

  // attach events
  document.querySelectorAll('.add-btn').forEach(b=>{
    b.addEventListener('click', ()=> addToCart(b.dataset.id, 1));
  });
  document.querySelectorAll('.view-btn').forEach(b=>{
    b.addEventListener('click', ()=> openModal(b.dataset.id));
  });
}

// CART functions
function addToCart(id, qty = 1) {
  const prod = products.find(p=>p.id===id);
  if(!prod) return;
  const existing = cart.find(i=>i.id===id);
  if(existing) existing.qty += qty;
  else cart.push({ id: prod.id, title: prod.title, price: prod.price, img: prod.img, qty: qty });
  updateCartCount();
  // small feedback
  const btn = document.querySelector(`.add-btn[data-id="${id}"]`);
  if(btn){
    btn.textContent = '✓ Added';
    setTimeout(()=>btn.textContent = 'Tambah', 900);
  }
  renderCart();
}

function removeFromCart(id){
  cart = cart.filter(i=>i.id!==id);
  updateCartCount();
  renderCart();
}

function changeQty(id, newQty){
  const it = cart.find(i=>i.id===id);
  if(!it) return;
  it.qty = Math.max(1, Number(newQty));
  renderCart();
  updateCartCount();
}

function updateCartCount(){
  const total = cart.reduce((s,i)=>s+i.qty,0);
  cartCount.textContent = total;
}

// render cart area
function renderCart(){
  if(cart.length === 0){
    cartArea.innerHTML = '<p class="muted">Keranjang kosong — tambahkan produk dari halaman produk.</p>';
    return;
  }
  cartArea.innerHTML = '';
  cart.forEach(item=>{
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <img src="${item.img}" alt="${item.title}" />
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong>${item.title}</strong>
            <div class="muted" style="font-size:13px">${rupiah(item.price)}</div>
          </div>
          <div class="qty-controls">
            <button class="qty-minus" data-id="${item.id}">−</button>
            <input class="qty-input" data-id="${item.id}" value="${item.qty}" style="width:46px;padding:6px;border-radius:8px;border:1px solid #eef2ff;text-align:center" />
            <button class="qty-plus" data-id="${item.id}">+</button>
            <button class="ghost-btn remove-btn" data-id="${item.id}">Hapus</button>
          </div>
        </div>
      </div>
    `;
    cartArea.appendChild(row);
  });

  // events
  document.querySelectorAll('.qty-minus').forEach(b=>{
    b.addEventListener('click', ()=> {
      const id = b.dataset.id;
      const it = cart.find(i=>i.id===id);
      if(!it) return;
      changeQty(id, it.qty - 1);
    });
  });
  document.querySelectorAll('.qty-plus').forEach(b=>{
    b.addEventListener('click', ()=> {
      const id = b.dataset.id;
      const it = cart.find(i=>i.id===id);
      if(!it) return;
      changeQty(id, it.qty + 1);
    });
  });
  document.querySelectorAll('.qty-input').forEach(inp=>{
    inp.addEventListener('change', ()=> changeQty(inp.dataset.id, inp.value));
  });
  document.querySelectorAll('.remove-btn').forEach(b=>{
    b.addEventListener('click', ()=> removeFromCart(b.dataset.id));
  });
}

// CHECKOUT preparation
function renderCheckout(){
  checkoutItems.innerHTML = '';
  if(cart.length === 0){
    checkoutItems.innerHTML = '<p class="muted">Keranjang kosong.</p>';
    checkoutTotal.textContent = rupiah(0);
    return;
  }
  let sum = 0;
  cart.forEach(i=>{
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.padding = '8px 0';
    row.innerHTML = `<div>${i.title} × ${i.qty}</div><div>${rupiah(i.price * i.qty)}</div>`;
    checkoutItems.appendChild(row);
    sum += i.price * i.qty;
  });
  // example shipping flat
  const shipping = 15000;
  const shippingRow = document.createElement('div');
  shippingRow.style.display = 'flex';
  shippingRow.style.justifyContent = 'space-between';
  shippingRow.style.padding = '8px 0';
  shippingRow.innerHTML = `<div>Ongkir</div><div>${rupiah(shipping)}</div>`;
  checkoutItems.appendChild(shippingRow);
  checkoutTotal.textContent = rupiah(sum + shipping);
}

// MODAL
function openModal(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  modalImg.src = p.img;
  modalTitle.textContent = p.title;
  modalDesc.textContent = p.desc;
  modalPrice.textContent = rupiah(p.price);
  modalQty.value = 1;
  modalAdd.dataset.id = p.id;
  productModal.classList.remove('hidden');
  productModal.setAttribute('aria-hidden','false');
}
modalClose.addEventListener('click', ()=> {
  productModal.classList.add('hidden');
  productModal.setAttribute('aria-hidden','true');
});
modalAdd.addEventListener('click', ()=> {
  addToCart(modalAdd.dataset.id, Number(modalQty.value));
  productModal.classList.add('hidden');
});

// checkout submit (mock)
checkoutForm.addEventListener('submit', e=>{
  e.preventDefault();
  if(cart.length === 0){ alert('Keranjang kosong.'); showSection('products'); return; }
  const form = new FormData(checkoutForm);
  const name = form.get('name');
  const phone = form.get('phone');
  const address = form.get('address');
  const payment = form.get('payment');
  // mock order id
  const orderId = 'ORD' + Date.now();
  // create whatsapp message for order confirmation
  const waText = encodeURIComponent(
    `Halo Madura Jaya,\n\nSaya sudah melakukan pesanan:\nOrder: ${orderId}\nNama: ${name}\nNo: ${phone}\nAlamat: ${address}\nMetode: ${payment}\n\nRincian:\n` +
    cart.map(i=>`${i.title} x${i.qty} — ${rupiah(i.price*i.qty)}`).join('\n') +
    `\n\nTotal: ${checkoutTotal.textContent}\n\nMohon konfirmasi.`
  );
  // open WhatsApp in new tab
  const waNumber = '6281292492845'; // ganti sesuai no toko
  window.open(`https://wa.me/${waNumber}?text=${waText}`, '_blank');
  // clear cart (simulate order placed)
  cart = [];
  updateCartCount();
  renderCart();
  showSection('home');
  alert('Order dibuat — Anda akan diarahkan ke WhatsApp untuk konfirmasi.');
});

// small interactions
document.getElementById('continue-shopping').addEventListener('click', ()=> showSection('products'));
document.getElementById('go-checkout').addEventListener('click', ()=> {
  if(cart.length === 0){ alert('Keranjang kosong.'); return; }
  showSection('checkout');
});
document.getElementById('back-to-cart').addEventListener('click', ()=> showSection('cart'));
checkoutShortcut.addEventListener('click', ()=> showSection('checkout'));

// search
searchInput.addEventListener('input', (e)=> renderProducts(e.target.value));

// quick WhatsApp link (contact button)
waLink.addEventListener('click', (e)=>{
  const waNumber = '6281292492845'; // ganti sesuai no toko
  const msg = encodeURIComponent('Halo, saya ingin membeli barang ini.');
  waLink.href = `https://wa.me/${waNumber}?text=${msg}`;
});

// initialize
renderProducts();
updateCartCount();
showSection('home');
