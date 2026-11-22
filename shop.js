/* Pancake House — menu, cart, stack builder, page motion (non-3D) */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = n => '$' + n.toFixed(2);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAX = 0.07; // NC 4.75% + Cleveland County 2.25%
  const PHONE = '(704) 482-9096';

  /* ---------------- menu data ---------------- */
  const STACK_SIZES = [
    { id: 'short', label: 'Short stack (3)', price: 0 },
    { id: 'tall', label: 'Tall stack (5)', price: 2.5 }
  ];
  const MENU = [
    { id: 'pancakes', title: 'Pancakes', note: 'Buttermilk batter, made every morning', items: [
      { id: 'classic', name: 'Buttermilk Classic', desc: 'Three fluffy buttermilk pancakes with whipped butter and warm maple syrup.', price: 7.49, img: 'butter-stack', tag: 'House favorite', stack: true, base: 'buttermilk' },
      { id: 'maple', name: 'Maple Cascade Stack', desc: 'Our classic stack, extra butter and a full pour of warm maple syrup.', price: 8.29, img: 'classic-stack', stack: true, base: 'buttermilk', preset: ['butter'] },
      { id: 'blueberry', name: 'Blueberry Pancakes', desc: 'Wild blueberries cooked right into the batter and scattered on top.', price: 8.99, img: 'blueberry', stack: true, base: 'blueberry' },
      { id: 'strawberry', name: 'Strawberries & Cream', desc: 'Fresh strawberries, strawberry glaze and a cloud of whipped cream.', price: 9.49, img: 'strawberry-cream', tag: 'Sweet', stack: true, base: 'buttermilk', preset: ['strawberry', 'cream'] },
      { id: 'chocchip', name: 'Chocolate Chip', desc: 'Semi-sweet chocolate chips melted into every layer, finished with butter.', price: 8.99, img: 'choc-chip', stack: true, base: 'chocolate' },
      { id: 'banananut', name: 'Banana Nut', desc: 'Sliced bananas and toasted walnuts over golden pancakes and syrup.', price: 9.29, img: 'banana-nut', stack: true, base: 'banana' },
      { id: 'pecan', name: 'Pecan Pancakes', desc: 'Toasted pecans in the batter and on top, with butter and maple syrup.', price: 9.49, img: 'pecan', tag: 'Southern', stack: true, base: 'pecan' },
      { id: 'strawstack', name: 'Strawberry Shortcake Stack', desc: 'A tall stack layered with strawberries and whipped cream.', price: 10.49, img: 'strawberry-stack', stack: true, base: 'buttermilk', preset: ['strawberry', 'cream'], size: 'tall' }
    ]},
    { id: 'waffles', title: 'Waffles', note: 'Crisp outside, soft inside', items: [
      { id: 'belgian', name: 'Belgian Waffle & Berries', desc: 'Deep-pocket Belgian waffle with blueberries, raspberries, butter and syrup.', price: 8.99, img: 'belgian-waffle', tag: 'Crispy' },
      { id: 'bbwaffle', name: 'Blueberry Golden Waffle', desc: 'Golden waffle topped with blueberries, raspberries and a pat of butter.', price: 9.29, img: 'blueberry-waffle' }
    ]},
    { id: 'plates', title: 'Breakfast plates', note: 'Served with toast or a biscuit', items: [
      { id: 'twoegg', name: 'Two Egg Breakfast', desc: 'Two eggs any style, crispy bacon, golden hash browns and buttered toast.', price: 9.99, img: 'diner-breakfast', tag: 'All-day' },
      { id: 'country', name: 'Country Breakfast', desc: 'Three eggs, bacon, hash browns and Texas toast. Big enough to share.', price: 11.99, img: 'diner-breakfast-2' },
      { id: 'omelet', name: 'Cheese Omelet', desc: 'Three-egg omelet with melted cheddar, home fries and toast.', price: 10.49, img: 'omelet' },
      { id: 'hamomelet', name: 'Ham & Cheddar Omelet', desc: 'Diced ham and cheddar folded into three eggs, with home fries and toast.', price: 11.49, img: 'omelet-2' },
      { id: 'biscuits', name: 'Biscuits & Sausage Gravy', desc: 'Two buttermilk biscuits smothered in peppery country sausage gravy.', price: 7.99, img: 'biscuits-gravy', tag: 'Southern' },
      { id: 'halfbiscuit', name: 'Half Biscuits & Gravy', desc: 'One big biscuit under the same sausage gravy. Great with a short stack.', price: 5.49, img: 'biscuits-gravy-2' }
    ]},
    { id: 'sides', title: 'Sides', note: 'Round out the table', list: true, items: [
      { id: 'bacon', name: 'Bacon', desc: 'Three crispy strips', price: 3.49 },
      { id: 'sausage', name: 'Sausage patties', desc: 'Two country patties', price: 3.49 },
      { id: 'hashbrowns', name: 'Hash browns', desc: 'Crispy shredded potatoes', price: 2.99 },
      { id: 'homefries', name: 'Home fries', desc: 'Seasoned skillet potatoes', price: 2.99 },
      { id: 'grits', name: 'Grits', desc: 'Creamy, with butter', price: 2.49 },
      { id: 'eggs', name: 'Two eggs', desc: 'Any style', price: 2.99 },
      { id: 'onecake', name: 'One pancake', desc: 'Buttermilk, with syrup', price: 2.99 },
      { id: 'biscuit', name: 'Biscuit', desc: 'With butter and jelly', price: 2.29 },
      { id: 'toast', name: 'Toast', desc: 'White, wheat or rye', price: 1.99 },
      { id: 'fruit', name: 'Fresh fruit cup', desc: 'Seasonal fruit', price: 3.49 }
    ]},
    { id: 'drinks', title: 'Drinks', note: 'Coffee is always on', list: true, items: [
      { id: 'coffee', name: 'Hot coffee', desc: 'Free refills', price: 2.29 },
      { id: 'tea', name: 'Sweet or unsweet tea', desc: 'Free refills', price: 2.29 },
      { id: 'hottea', name: 'Hot tea', desc: 'Assorted', price: 1.99 },
      { id: 'oj', name: 'Orange juice', desc: 'Small or large', price: 3.29 },
      { id: 'milk', name: 'Milk', desc: 'Cold whole milk', price: 2.49 },
      { id: 'chocmilk', name: 'Chocolate milk', desc: 'Kids love it', price: 2.79 },
      { id: 'cocoa', name: 'Hot chocolate', desc: 'With whipped cream', price: 2.79 }
    ]}
  ];
  const ITEMS = {};
  MENU.forEach(c => c.items.forEach(i => { ITEMS[i.id] = Object.assign({ cat: c.id }, i); }));

  const BASES = [
    { id: 'buttermilk', label: 'Buttermilk', price: 7.49, color: null },
    { id: 'blueberry', label: 'Blueberry', price: 8.99, color: '#3d4f8f' },
    { id: 'chocolate', label: 'Chocolate chip', price: 8.99, color: '#4a2a12' },
    { id: 'banana', label: 'Banana nut', price: 9.29, color: '#f3e2a4' },
    { id: 'pecan', label: 'Pecan', price: 9.49, color: '#7a4419' }
  ];
  const TOPPINGS = [
    { id: 'butter', label: 'Extra butter', price: 0.5 },
    { id: 'cream', label: 'Whipped cream', price: 0.99 },
    { id: 'strawberry', label: 'Strawberries', price: 1.49 },
    { id: 'blueberries', label: 'Blueberries', price: 1.29 },
    { id: 'bananas', label: 'Bananas', price: 0.99 },
    { id: 'pecans', label: 'Pecans', price: 1.29 },
    { id: 'chips', label: 'Chocolate chips', price: 0.99 }
  ];
  const SYRUPS = [
    { id: 'maple', label: 'Warm maple' },
    { id: 'butter-pecan', label: 'Butter pecan' },
    { id: 'strawberry', label: 'Strawberry' },
    { id: 'none', label: 'On the side' }
  ];

  /* ---------------- render menu ---------------- */
  const root = $('#menuRoot'), tabs = $('#tabs');
  const plusIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  let html = '';
  MENU.forEach((c, ci) => {
    tabs.insertAdjacentHTML('beforeend', `<button class="tab" role="tab" type="button" aria-selected="${ci === 0}" data-target="cat-${c.id}">${c.title}</button>`);
    html += `<div class="cat" id="cat-${c.id}"><div class="cat-title"><h3>${c.title}</h3><span>${c.note}</span></div>`;
    if (c.id === 'pancakes') {
      html += '';
    }
    if (c.list) {
      html += '<div class="list">' + c.items.map(i => `
        <div class="row"><div><h4>${i.name}</h4><p>${i.desc}</p></div><span class="price">${money(i.price)}</span>
        <button class="plus" type="button" data-add="${i.id}" aria-label="Add ${i.name} to order">+</button></div>`).join('') + '</div>';
    } else {
      html += '<div class="grid">' + c.items.map(i => `
        <article class="card"><div class="card-inner">
          <div class="card-media"><img src="assets/${i.img}.jpg" alt="${i.name}" loading="lazy" width="720" height="964">${i.tag ? `<span class="tag">${i.tag}</span>` : ''}</div>
          <div class="card-body"><h4>${i.name}</h4><p>${i.desc}</p>
            <div class="card-foot"><span class="price">${money(i.price)}</span>
              ${i.stack ? `<button class="link-btn" type="button" data-custom="${i.id}">Customize</button>` : ''}
              <button class="add" type="button" data-add="${i.id}" aria-label="Add ${i.name} to order">${plusIcon}<span>Add</span></button>
            </div></div></div></article>`).join('') + '</div>';
    }
    html += '</div>';
    if (c.id === 'pancakes') {
      html += `<div class="builder-band"><div><h3>Build your own stack</h3><p>Choose a batter, go short or tall, pile on toppings and pick your syrup. Watch it stack up as you go.</p></div>
        <button class="btn btn-orange" type="button" data-open-builder>Start stacking <span aria-hidden="true">›</span></button></div>`;
    }
  });
  root.innerHTML = html;

  /* tabs: scroll to category, highlight the section that is actually under the sticky tabs */
  const cats = $$('.cat');
  const tabBtns = $$('.tab', tabs);
  const navEl = $('#nav');
  let activeId = null, spyLock = false, lockTimer = null;
  // the reading line sits just below the sticky nav + tab bar
  const readLine = () => navEl.offsetHeight + tabs.offsetHeight + 24;
  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    tabBtns.forEach(t => {
      const on = t.dataset.target === id;
      t.setAttribute('aria-selected', on);
      if (on && tabs.scrollWidth > tabs.clientWidth) {
        tabs.scrollTo({ left: Math.max(0, t.offsetLeft - (tabs.clientWidth - t.offsetWidth) / 2), behavior: reduce ? 'auto' : 'smooth' });
      }
    });
  }
  function spy() {
    if (spyLock) return;
    const line = readLine();
    let current = cats[0].id;
    for (const c of cats) {
      if (c.getBoundingClientRect().top <= line) current = c.id; else break;
    }
    setActive(current);
  }
  let spyQueued = false;
  addEventListener('scroll', () => {
    if (spyQueued) return;
    spyQueued = true;
    requestAnimationFrame(() => { spyQueued = false; spy(); });
  }, { passive: true });
  addEventListener('resize', spy);
  spy();

  tabs.addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (!b) return;
    const el = document.getElementById(b.dataset.target);
    // land the heading just under the tab bar, and keep the clicked tab lit while we travel
    const y = el.getBoundingClientRect().top + scrollY - (navEl.offsetHeight + tabs.offsetHeight + 8);
    setActive(el.id);
    spyLock = true; clearTimeout(lockTimer);
    const unlock = () => { clearTimeout(lockTimer); spyLock = false; spy(); };
    lockTimer = setTimeout(unlock, 1800);
    if (window.lenis) window.lenis.scrollTo(y, { duration: 1.1, onComplete: unlock });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* 3D tilt on cards */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    $$('.card').forEach(card => {
      const inner = $('.card-inner', card);
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(0)`;
      });
      card.addEventListener('pointerleave', () => { inner.style.transform = ''; });
    });
  }

  /* ---------------- cart ---------------- */
  const KEY = 'ph-cart-v1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]'); if (!Array.isArray(cart)) cart = []; } catch (e) { cart = []; }
  cart = cart.filter(l => l && l.name && typeof l.unit === 'number' && l.qty > 0);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };

  function addLine(line, srcEl) {
    const found = cart.find(l => l.key === line.key);
    if (found) found.qty += line.qty; else cart.push(line);
    save(); renderCart(); bumpCount();
    toast(`${line.name} added to your order`);
    if (srcEl) flyToCart(srcEl, line.img);
  }
  function simpleLine(item, size) {
    let unit = item.price, opts = [];
    if (item.stack) {
      const s = STACK_SIZES.find(z => z.id === (size || item.size || 'short'));
      if (item.size === 'tall' && s.id === 'tall') { /* price already tall */ } else unit += s.price;
      opts.push(s.label);
    }
    return { key: item.id + '|' + opts.join(','), id: item.id, name: item.name, img: item.img || null, unit: +unit.toFixed(2), qty: 1, opts };
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]');
    if (a) {
      const item = ITEMS[a.dataset.add];
      const media = a.closest('.card') ? $('.card-media img', a.closest('.card')) : a;
      addLine(simpleLine(item), media);
      a.classList.add('done');
      const label = a.querySelector('span');
      if (label) { label.textContent = 'Added'; setTimeout(() => { label.textContent = 'Add'; a.classList.remove('done'); }, 1300); }
      else setTimeout(() => a.classList.remove('done'), 1300);
      return;
    }
    const c = e.target.closest('[data-custom]');
    if (c) { openBuilder(ITEMS[c.dataset.custom]); return; }
    if (e.target.closest('[data-open-builder]')) { openBuilder(null); }
  });

  function bumpCount() {
    $$('[data-count]').forEach(el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  }
  function flyToCart(srcEl, img) {
    if (reduce) return;
    const target = $('#fab').getBoundingClientRect();
    const r = srcEl.getBoundingClientRect();
    const f = document.createElement(img ? 'img' : 'span');
    f.className = 'flyer' + (img ? '' : ' slice');
    if (img) f.src = 'assets/' + img + '.jpg';
    const size = 70;
    f.style.left = (r.left + r.width / 2 - size / 2) + 'px';
    f.style.top = (r.top + r.height / 2 - size / 2) + 'px';
    document.body.appendChild(f);
    const dx = target.left + target.width / 2 - (r.left + r.width / 2);
    const dy = target.top + target.height / 2 - (r.top + r.height / 2);
    if (window.gsap) {
      gsap.timeline({ onComplete: () => f.remove() })
        .fromTo(f, { scale: 0.3, opacity: 0 }, { scale: 1.1, opacity: 1, duration: 0.25, ease: 'back.out(2)' })
        .to(f, { x: dx, duration: 0.75, ease: 'power2.in' }, '>-0.02')
        .to(f, { y: dy, duration: 0.75, ease: 'back.in(1.4)' }, '<')
        .to(f, { scale: 0.25, rotate: 260, duration: 0.75, ease: 'power2.in' }, '<');
    } else f.remove();
  }

  const drawer = $('#drawer'), scrim = $('#scrim'), body = $('#drawerBody'), foot = $('#drawerFoot');
  let view = 'cart', orderType = 'pickup', lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    view = 'cart'; renderCart();
    drawer.classList.add('open'); scrim.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock'); window.lenis && window.lenis.stop();
    setTimeout(() => $('#closeCart').focus(), 60);
  }
  function closeCart() {
    drawer.classList.remove('open'); scrim.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock'); window.lenis && window.lenis.start();
    if (lastFocus) lastFocus.focus();
  }
  $('#fab').addEventListener('click', openCart);
  $('#navCart').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  scrim.addEventListener('click', closeCart);

  const totals = () => {
    const sub = cart.reduce((s, l) => s + l.unit * l.qty, 0);
    const tax = Math.round(sub * TAX * 100) / 100;
    return { sub, tax, total: sub + tax, count: cart.reduce((s, l) => s + l.qty, 0) };
  };

  function renderCart() {
    const t = totals();
    $$('[data-count]').forEach(el => { el.textContent = t.count; el.dataset.n = t.count; });
    $('#drawerTitle').textContent = view === 'checkout' ? 'Checkout' : view === 'done' ? 'Order ready' : 'Your order';
    if (view === 'done') return;
    if (!cart.length) {
      body.innerHTML = `<div class="empty"><div class="slice"></div><p><strong>Your plate is empty.</strong><br>Add a stack, a waffle or a country breakfast from the menu.</p>
        <button class="btn btn-caramel" type="button" id="browse">Browse the menu</button></div>`;
      foot.innerHTML = '';
      $('#browse').addEventListener('click', () => { closeCart(); const m = $('#menu'); window.lenis ? window.lenis.scrollTo(m, { offset: -70 }) : m.scrollIntoView(); });
      return;
    }
    if (view === 'cart') {
      body.innerHTML = cart.map((l, i) => `
        <div class="line">
          ${l.img ? `<img src="assets/${l.img}.jpg" alt="">` : `<span class="thumb">${l.name[0]}</span>`}
          <div><h4>${l.name}</h4>${l.opts && l.opts.length ? `<small>${l.opts.join(' · ')}</small>` : ''}
            <div><span class="qty"><button type="button" data-dec="${i}" aria-label="Remove one ${l.name}">−</button><span>${l.qty}</span><button type="button" data-inc="${i}" aria-label="Add one more ${l.name}">+</button></span>
            <button class="rm" type="button" data-rm="${i}">Remove</button></div></div>
          <span class="lp">${money(l.unit * l.qty)}</span>
        </div>`).join('');
      foot.innerHTML = `
        <div class="sum"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><span>${money(t.sub)}</span></div>
        <div class="sum"><span>Sales tax (7%)</span><span>${money(t.tax)}</span></div>
        <div class="sum total"><span>Total</span><span>${money(t.total)}</span></div>
        <button class="btn btn-orange" type="button" id="toCheckout">Checkout · ${money(t.total)}</button>`;
      $('#toCheckout').addEventListener('click', () => { view = 'checkout'; renderCart(); });
    } else if (view === 'checkout') {
      const slots = pickupSlots();
      body.innerHTML = `
        <form class="checkout" id="coForm" novalidate>
          <div class="seg" role="group" aria-label="Order type">
            <button type="button" data-type="pickup" aria-pressed="${orderType === 'pickup'}">Pickup</button>
            <button type="button" data-type="dinein" aria-pressed="${orderType === 'dinein'}">Dine in</button>
          </div>
          <label for="coName">Name for the order<input id="coName" name="name" autocomplete="name" required placeholder="Your name"></label>
          <label for="coPhone">Phone<input id="coPhone" name="phone" type="tel" autocomplete="tel" required placeholder="(704) 555-0123"></label>
          <label for="coTime">${orderType === 'pickup' ? 'Pickup time' : 'Arrival time'}
            <select id="coTime" name="time">${slots.length ? slots.map(s => `<option>${s}</option>`).join('') : '<option>Tomorrow, 6:30 AM</option>'}</select></label>
          <label for="coNote">Notes for the kitchen<textarea id="coNote" name="note" rows="2" placeholder="Extra crispy bacon, syrup on the side…"></textarea></label>
          <div class="err" id="coErr" role="alert"></div>
        </form>`;
      foot.innerHTML = `
        <div class="sum total"><span>Total</span><span>${money(t.total)}</span></div>
        <div style="display:flex;gap:10px"><button class="btn btn-ghost" type="button" id="back" style="width:auto">Back</button>
        <button class="btn btn-orange" type="button" id="place">Place order</button></div>`;
      $$('.seg button', body).forEach(b => b.addEventListener('click', () => { orderType = b.dataset.type; const keep = formVals(); renderCart(); fillVals(keep); }));
      $('#back').addEventListener('click', () => { view = 'cart'; renderCart(); });
      $('#place').addEventListener('click', placeOrder);
      $('#coForm').addEventListener('submit', e => { e.preventDefault(); placeOrder(); });
    }
  }
  const formVals = () => ({ name: $('#coName')?.value || '', phone: $('#coPhone')?.value || '', note: $('#coNote')?.value || '' });
  const fillVals = v => { $('#coName').value = v.name; $('#coPhone').value = v.phone; $('#coNote').value = v.note; };

  body.addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rm = e.target.closest('[data-rm]');
    if (inc) cart[+inc.dataset.inc].qty++;
    else if (dec) { const l = cart[+dec.dataset.dec]; l.qty--; if (l.qty < 1) cart.splice(+dec.dataset.dec, 1); }
    else if (rm) cart.splice(+rm.dataset.rm, 1);
    else return;
    save(); renderCart();
  });

  function shelbyNow() {
    // Shelby, NC is US Eastern time
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour12: false, weekday: 'short', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t).value;
    return { day: get('weekday'), h: +get('hour') % 24, m: +get('minute') };
  }
  function pickupSlots() {
    const n = shelbyNow();
    const out = [];
    let mins = Math.max(n.h * 60 + n.m + 20, 6 * 60);
    mins = Math.ceil(mins / 15) * 15;
    for (; mins <= 13 * 60 + 45 && out.length < 16; mins += 15) {
      const h = Math.floor(mins / 60), m = mins % 60;
      out.push(`Today, ${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`);
    }
    if (!out.length) ['6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '10:00 AM', '11:00 AM'].forEach(s => out.push('Tomorrow, ' + s));
    return out;
  }
  function placeOrder() {
    const name = $('#coName').value.trim(), phone = $('#coPhone').value.trim(), err = $('#coErr');
    if (!name) { err.textContent = 'Add a name so we know whose stack it is.'; $('#coName').focus(); return; }
    if (phone.replace(/\D/g, '').length < 10) { err.textContent = 'Enter a 10-digit phone number so we can reach you about the order.'; $('#coPhone').focus(); return; }
    const t = totals();
    const num = 'PH-' + Math.floor(1000 + Math.random() * 9000);
    const time = $('#coTime').value, note = $('#coNote').value.trim();
    const items = cart.map(l => `<li>${l.qty} × ${l.name}${l.opts && l.opts.length ? ` <small>(${l.opts.join(', ')})</small>` : ''} — ${money(l.unit * l.qty)}</li>`).join('');
    view = 'done';
    $('#drawerTitle').textContent = 'Order ready';
    body.innerHTML = `
      <div class="ticket"><h4>Order ${num}</h4>
        <div><strong>${orderType === 'pickup' ? 'Pickup' : 'Dine in'}</strong> · ${time}<br>${escapeHtml(name)} · ${escapeHtml(phone)}</div>
        <ul>${items}</ul>${note ? `<div><em>Note:</em> ${escapeHtml(note)}</div>` : ''}
        <div class="sum total" style="margin:12px 0 0"><span>Total</span><span>${money(t.total)}</span></div></div>
      <p class="notice">Online ordering isn't connected to the kitchen yet. To confirm, call <strong>${PHONE}</strong> and read them order ${num}. Pay at the counter.</p>`;
    foot.innerHTML = `<button class="btn btn-caramel" type="button" id="newOrder">Start a new order</button>`;
    $('#newOrder').addEventListener('click', () => { cart = []; save(); view = 'cart'; renderCart(); closeCart(); });
  }
  const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- stack builder ---------------- */
  const modal = $('#builder'), mscrim = $('#mscrim'), opts = $('#builderOptions'), pstack = $('#pstack');
  let B = null, bFocus = null;
  function openBuilder(item) {
    bFocus = document.activeElement;
    B = { base: item ? item.base : 'buttermilk', size: item && item.size ? item.size : 'short', tops: new Set(item && item.preset ? item.preset : []), syrup: 'maple', from: item || null };
    renderBuilder(true);
    modal.classList.add('open'); mscrim.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock'); window.lenis && window.lenis.stop();
    setTimeout(() => $('#closeBuilder').focus(), 60);
  }
  function closeBuilder() {
    modal.classList.remove('open'); mscrim.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock'); window.lenis && window.lenis.start();
    if (bFocus) bFocus.focus();
  }
  $('#closeBuilder').addEventListener('click', closeBuilder);
  mscrim.addEventListener('click', closeBuilder);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (modal.classList.contains('open')) closeBuilder(); else if (drawer.classList.contains('open')) closeCart();
  });
  const bPrice = () => {
    const base = BASES.find(b => b.id === B.base).price;
    const size = STACK_SIZES.find(s => s.id === B.size).price;
    const tops = TOPPINGS.filter(t => B.tops.has(t.id)).reduce((s, t) => s + t.price, 0);
    return +(base + size + tops).toFixed(2);
  };
  function renderBuilder(animateAll) {
    const chip = (group, o, on, extra) => `<button class="chip" type="button" data-g="${group}" data-v="${o.id}" aria-pressed="${on}">${o.label}${extra ? `<small>${extra}</small>` : ''}</button>`;
    opts.innerHTML = `
      <div><h4>Batter</h4><div class="chips">${BASES.map(b => chip('base', b, B.base === b.id, money(b.price))).join('')}</div></div>
      <div><h4>Size</h4><div class="chips">${STACK_SIZES.map(s => chip('size', s, B.size === s.id, s.price ? '+' + money(s.price) : '')).join('')}</div></div>
      <div><h4>Toppings</h4><div class="chips">${TOPPINGS.map(t => chip('top', t, B.tops.has(t.id), '+' + money(t.price))).join('')}</div></div>
      <div><h4>Syrup</h4><div class="chips">${SYRUPS.map(s => chip('syrup', s, B.syrup === s.id)).join('')}</div></div>
      <div class="opt-foot"><span class="price" id="bPrice">${money(bPrice())}</span><button class="btn btn-orange" type="button" id="bAdd">Add to order</button></div>`;
    drawStack(animateAll);
  }
  function drawStack(animateAll) {
    const n = B.size === 'tall' ? 5 : 3;
    const base = BASES.find(b => b.id === B.base);
    const prev = pstack.children.length;
    let h = '';
    for (let i = 0; i < n; i++) {
      const dots = base.color ? Array.from({ length: 7 }, (_, k) => `<i style="position:absolute;width:6px;height:6px;border-radius:50%;background:${base.color};left:${12 + k * 12}%;top:${30 + (k % 3) * 12}%"></i>`).join('') : '';
      const delay = animateAll || i >= prev ? (animateAll ? i * 0.09 : (i - prev) * 0.09) : -1;
      h += `<div class="pc" style="${delay < 0 ? 'animation:none' : `animation-delay:${delay}s`}">${dots}${i === n - 1 ? toppingHtml() : ''}</div>`;
    }
    pstack.innerHTML = h;
  }
  function toppingHtml() {
    const parts = [];
    if (B.syrup !== 'none') parts.push(`<span class="syrup-drip" style="background:${B.syrup === 'strawberry' ? 'rgba(200,40,50,.7)' : 'rgba(160,80,20,.75)'}"></span>`);
    const t = B.tops;
    let s = '';
    if (t.has('cream')) s += '<span class="t-cream"></span>';
    if (t.has('butter') || !t.size) s += '<span class="t-butter"></span>';
    const dot = (c, n) => Array.from({ length: n }, (_, k) => `<span class="t-dot" style="background:${c};animation-delay:${k * 0.04}s"></span>`).join('');
    if (t.has('strawberry')) s += dot('radial-gradient(circle at 35% 30%,#ff8a8a,#c8202d)', 4);
    if (t.has('blueberries')) s += dot('radial-gradient(circle at 35% 30%,#7d8cd6,#26306b)', 5);
    if (t.has('bananas')) s += dot('radial-gradient(circle,#fbf1d2 55%,#e6cf86)', 4);
    if (t.has('pecans')) s += dot('linear-gradient(#a25b25,#6b3510)', 4);
    if (t.has('chips')) s += dot('#3a200c', 5);
    return parts.join('') + `<span class="topping">${s}</span>`;
  }
  opts.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (c) {
      const g = c.dataset.g, v = c.dataset.v;
      if (g === 'base') B.base = v;
      if (g === 'size') B.size = v;
      if (g === 'syrup') B.syrup = v;
      if (g === 'top') B.tops.has(v) ? B.tops.delete(v) : B.tops.add(v);
      const pressed = $$(`.chip[data-g="${g}"]`, opts);
      pressed.forEach(p => p.setAttribute('aria-pressed', g === 'top' ? B.tops.has(p.dataset.v) : p.dataset.v === v));
      $('#bPrice').textContent = money(bPrice());
      drawStack(false);
      return;
    }
    if (e.target.closest('#bAdd')) {
      const base = BASES.find(b => b.id === B.base);
      const size = STACK_SIZES.find(s => s.id === B.size);
      const tops = TOPPINGS.filter(t => B.tops.has(t.id)).map(t => t.label);
      const syrup = SYRUPS.find(s => s.id === B.syrup);
      const optsList = [size.label, ...tops, syrup.id === 'none' ? 'Syrup on the side' : syrup.label + ' syrup'];
      const name = B.from ? B.from.name : `${base.label} stack`;
      const imgMap = { buttermilk: 'butter-stack', blueberry: 'blueberry', chocolate: 'choc-chip', banana: 'banana-nut', pecan: 'pecan' };
      const img = B.from ? B.from.img : imgMap[base.id];
      addLine({ key: 'custom|' + name + '|' + base.id + '|' + optsList.join(','), id: 'custom', name, img, unit: bPrice(), qty: 1, opts: B.from && B.from.base !== base.id ? [base.label + ' batter', ...optsList] : optsList }, null);
      closeBuilder();
    }
  });

  /* ---------------- hours ---------------- */
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
  const now = shelbyNow();
  $('#hoursTable').innerHTML = DAYS.map(d => `<tr class="${d === now.day ? 'today' : ''}"><td>${FULL[d]}${d === now.day ? ' (today)' : ''}</td><td>6:00 AM – 2:00 PM</td></tr>`).join('');
  const mins = now.h * 60 + now.m, open = mins >= 360 && mins < 840;
  const on = $('#openNow');
  on.classList.toggle('yes', open);
  on.querySelector('span').textContent = open ? `Open now · closes at 2 PM (${Math.floor((840 - mins) / 60)}h ${(840 - mins) % 60}m left)` : (mins < 360 ? 'Closed · opens today at 6 AM' : 'Closed · opens tomorrow at 6 AM');
  $('#yr').textContent = new Date().getFullYear();

  /* copy phone */
  $('#copyPhone').addEventListener('click', () => {
    const b = $('#copyPhone');
    const done = () => { b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy number', 1500); };
    try {
      navigator.clipboard.writeText(PHONE).then(done, () => { selectPhone(); b.textContent = 'Selected, press Ctrl+C'; });
    } catch (e) { selectPhone(); }
  });
  function selectPhone() { const r = document.createRange(); r.selectNodeContents($('#phone')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }

  /* toast */
  let tt;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 1800); }

  /* marquee */
  const words = ['Buttermilk', 'Blueberry', 'Pecan', 'Banana nut', 'Chocolate chip', 'Belgian waffles', 'Biscuits & gravy', 'Hot coffee'];
  $('#marquee').innerHTML = [...words, ...words].map(w => `<span>${w}</span>`).join('');

  renderCart();

  /* ---------------- page motion (GSAP) ---------------- */
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const el = id === '#top' ? 0 : document.querySelector(id);
      if (el === null) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: id === '#menu' ? -60 : 0, duration: 1.4 });
    });
  }

  /* nav state */
  const nav = $('#nav');
  ScrollTrigger.create({ start: 10, end: 'max', onToggle: s => nav.classList.toggle('scrolled', s.isActive) });
  ScrollTrigger.create({ trigger: '#landing', start: 'top 60', end: 'bottom 60', onToggle: s => nav.classList.toggle('is-dark', s.isActive) });
  ScrollTrigger.create({ trigger: 'footer', start: 'top 60', end: 'bottom top', onToggle: s => nav.classList.toggle('is-dark', s.isActive) });

  /* split text helper */
  function split(el) {
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            const ws = document.createElement('span'); ws.className = 'word';
            [...w].forEach(ch => { const c = document.createElement('span'); c.className = 'char'; c.textContent = ch; ws.appendChild(c); });
            frag.appendChild(ws);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    $$('.word', el).forEach(w => w.setAttribute('aria-hidden', 'true'));
    return $$('.char', el);
  }
  window.__split = split;

  if (reduce) return;

  /* landing headline: letters bounce in as it scrolls into view */
  const landChars = split($('.landing h2'));
  gsap.from(landChars, { yPercent: 110, rotate: () => gsap.utils.random(-14, 14), opacity: 0, stagger: 0.025, duration: 0.8, ease: 'back.out(2.2)',
    scrollTrigger: { trigger: '.landing', start: 'top 55%' } });
  gsap.from('.landing .lede, .landing .cta-row, .sweet', { y: 40, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.landing', start: 'top 40%' } });
  $$('.floaty').forEach((f, i) => {
    gsap.to(f, { y: -120 - i * 60, rotate: 120 * (i % 2 ? -1 : 1), ease: 'none', scrollTrigger: { trigger: '.landing', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.to(f, { y: '+=14', duration: 2 + i * 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  });
  const vid = $('#pour');
  ScrollTrigger.create({ trigger: '.landing', start: 'top bottom', end: 'bottom top',
    onToggle: s => { if (s.isActive) { vid.play().then(() => vid.previousElementSibling.style.opacity = 0).catch(() => {}); } else vid.pause(); } });
  gsap.fromTo(vid, { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.landing', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* section headings */
  $$('.reveal').forEach(h => {
    const chars = split(h);
    gsap.from(chars, { yPercent: 100, opacity: 0, rotate: () => gsap.utils.random(-10, 10), stagger: 0.02, duration: 0.7, ease: 'back.out(2)', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  /* cards rise in */
  ScrollTrigger.batch('.card, .row, .builder-band', {
    start: 'top 92%',
    onEnter: els => gsap.from(els, { y: 60, opacity: 0, rotateX: -12, stagger: 0.07, duration: 0.9, ease: 'power3.out', overwrite: true }),
    once: true
  });
  gsap.from('.hours', { y: 60, rotate: 3, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.visit', start: 'top 70%' } });
  gsap.fromTo('.foot-word', { xPercent: 8 }, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: 'footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
})();
