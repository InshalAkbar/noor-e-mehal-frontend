/* =========================================================
   pages.js — page-specific rendering (detail / product /
   booking / booking_success). Replaces the PHP loops that
   read $_GET and the PHP data arrays. Data lives in data.js
   ========================================================= */
(function () {
  'use strict';

  var D = window.NOOR_DATA || {};
  var page = document.body.getAttribute('data-page');
  var q = new URLSearchParams(window.location.search);

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function setText(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }
  function intParam(name, def) { var n = parseInt(q.get(name), 10); return isNaN(n) ? def : n; }
  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }

  /* ---------------- detail.html?id=N ---------------- */
  function initDetail() {
    var id = intParam('id', 1);
    var svc = D.services && D.services[id];
    if (!svc) { id = 1; svc = D.services[1]; }

    document.title = svc.title + ' | Noor-E-Mahal';
    document.body.style.backgroundImage = "url('" + svc.banner + "')";
    setText('serviceTitle', svc.title);
    setText('serviceSubtitle', svc.subtitle);

    var grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = svc.products.map(function (p) {
      return '' +
        '<div class="product-card">' +
          '<div class="product-image">' +
            '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '">' +
            '<div class="product-badge">' + esc(p.badge) + '</div>' +
            '<div class="product-rating">' +
              '<span class="stars">\u2B50</span>' +
              '<span class="rating-num">' + esc(p.rating) + '</span>' +
              '<button class="wishlist-btn"><i class="far fa-heart"></i></button>' +
            '</div>' +
          '</div>' +
          '<div class="product-content">' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<p class="product-desc">' + esc(p.description) + '</p>' +
            '<div class="product-features">' +
              p.features.map(function (f) { return '<span>\u2714 ' + esc(f) + '</span>'; }).join('') +
            '</div>' +
            '<div class="product-buttons">' +
              '<a href="product.html?product=' + p.id + '&service=' + id + '" class="btn-details">' +
                'View Details <i class="fas fa-arrow-right"></i>' +
              '</a>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  /* ---------------- product.html?product=N&service=N ---------------- */
  function initProduct() {
    var pid = intParam('product', 101);
    var sid = intParam('service', 0);
    if (sid === 0) {
      if (pid >= 1000) sid = Math.floor(Math.floor(pid / 10) / 100);
      else sid = Math.floor(pid / 100);
    }

    var subLists = D.subProducts || {};
    var isSub = false, subData = null;
    if (pid >= 1000) {
      isSub = true;
      var parent = Math.floor(pid / 10);
      (subLists[parent] || []).some(function (sp) {
        if (sp.id === pid) { subData = sp; return true; }
        return false;
      });
    }

    var info, image;
    if (isSub && subData) {
      info = subData;
      image = subData.image;
    } else {
      info = (D.mainProducts && D.mainProducts[pid]) || {
        title: 'Luxury Service', subtitle: 'Premium Wedding Service', image: './images/wedplaning.jpg',
        guests: 'N/A', capacity: 'N/A', timing: 'N/A', location: 'N/A', type: 'N/A'
      };
      image = (D.serviceBanners && D.serviceBanners[sid]) || info.image;
    }
    var fallback = (D.fallbackImages && D.fallbackImages[pid]) ||
                   (D.serviceBanners && D.serviceBanners[sid]) || './images/wedplaning.jpg';
    var serviceName = (D.serviceTitles && D.serviceTitles[sid]) || 'Services';
    var list = (!isSub && subLists[pid]) ? subLists[pid] : [];

    window.PAGE = { title: info.title, image: image, fallback: fallback };

    document.title = info.title + ' | Noor-E-Mahal';
    document.body.style.backgroundImage = "url('" + image + "')";
    setText('pgTitle', info.title);
    setText('pgSubtitle', info.subtitle);
    setText('pgGuests', info.guests);
    setText('pgCapacity', info.capacity);
    setText('pgTiming', info.timing);
    setText('pgLocation', info.location);
    setText('pgType', info.type);
    setText('pgRating', '5.0 Rating');
    setText('pgIntro', 'Select from our premium ' + String(info.title).toLowerCase() + ' options for your special day.');

    var back = document.getElementById('pgBack');
    if (back) {
      back.setAttribute('href', 'detail.html?id=' + sid);
      back.innerHTML = '<i class="fas fa-arrow-left"></i> Back to ' + esc(serviceName);
    }

    var grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML =
        '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #999;">' +
          '<i class="fas fa-box-open" style="font-size: 48px; color: var(--gold); margin-bottom: 20px;"></i>' +
          '<h3>No options available</h3>' +
          '<p>Please check back later for updates.</p>' +
        '</div>';
      return;
    }
    grid.innerHTML = list.map(function (sub) {
      var extra = sub.features.length - 3;
      return '' +
        '<div class="product-card">' +
          '<a href="product.html?product=' + sub.id + '&service=' + sid + '" style="text-decoration:none; color:inherit; display:block;">' +
            '<div class="product-image">' +
              '<img src="' + esc(sub.image) + '" alt="' + esc(sub.title) + '" loading="lazy" onerror="this.onerror=null; this.src=\'' + esc(fallback) + '\';">' +
            '</div>' +
            '<div class="card-details">' +
              '<div class="card-detail"><i class="fas fa-users"></i><strong>' + esc(sub.guests) + '</strong></div>' +
              '<div class="card-detail"><i class="fas fa-expand"></i><strong>' + esc(sub.capacity) + '</strong></div>' +
              '<div class="card-detail"><i class="fas fa-clock"></i><strong>' + esc(sub.timing) + '</strong></div>' +
              '<div class="card-detail"><i class="fas fa-location-dot"></i><strong>' + esc(sub.location) + '</strong></div>' +
            '</div>' +
            '<div class="product-content">' +
              '<h3>' + esc(sub.title) + '</h3>' +
              '<p class="product-desc">' + esc(String(sub.description).substring(0, 80)) + '...</p>' +
              '<div class="product-rating"><span class="stars">\u2605\u2605\u2605\u2605\u2605</span><span class="rating-num">' + esc(sub.rating) + '</span></div>' +
              '<div class="product-features">' +
                sub.features.slice(0, 3).map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('') +
                (extra > 0 ? '<span>+' + extra + ' more</span>' : '') +
              '</div>' +
              '<div class="product-price">' + esc(sub.price) + '</div>' +
            '</div>' +
          '</a>' +
          '<div style="padding: 0 25px 25px;">' +
            '<a href="booking.html?product=' + sub.id + '&service=' + sid + '" class="btn-book"><i class="fas fa-calendar-check"></i> Book Now</a>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  /* ---------------- booking.html?product=N&service=N ---------------- */
  function initBooking() {
    var pid = intParam('product', 0);
    var sid = intParam('service', 0);
    var name = '', price = '';

    var bp = D.bookingProducts && D.bookingProducts[pid];
    if (bp) { name = bp.name; price = bp.price; }
    else {
      var lists = D.subProducts || {};
      Object.keys(lists).some(function (k) {
        return lists[k].some(function (sp) {
          if (sp.id === pid) { name = sp.title; price = sp.price; return true; }
          return false;
        });
      });
    }
    setText('bkName', name || 'Selected Package');
    setText('bkPrice', price || 'Contact for Price');

    var form = document.getElementById('bookingForm');
    if (!form) return;
    var f = form.elements;
    f['product_id'].value = pid;
    f['service_id'].value = sid;
    f['product_name'].value = name;
    f['product_price'].value = price;

    var user = load('noor_current_user', null);
    if (user) {
      f['full_name'].value = user.name || '';
      f['email'].value = user.email || '';
      f['phone'].value = user.phone || '';
    }
    var today = new Date().toISOString().slice(0, 10);
    f['event_date'].setAttribute('min', today);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = document.getElementById('bkError');
      if (err) err.style.display = 'none';

      var fullName = f['full_name'].value.trim();
      var email = f['email'].value.trim();
      var phone = f['phone'].value.trim();
      var date = f['event_date'].value.trim();
      if (!fullName || !email || !phone || !date) {
        if (err) {
          err.querySelector('span').textContent = 'Please fill in all required fields.';
          err.style.display = '';
        }
        return;
      }

      var bookings = load('noor_bookings', []);
      var bookingId = bookings.length + 1;
      bookings.push({
        id: bookingId, product_id: pid, service_id: sid,
        product_name: name, product_price: price,
        full_name: fullName, email: email, phone: phone,
        event_date: date, guests: parseInt(f['guests'].value, 10) || 0,
        notes: f['notes'].value.trim(), status: 'pending'
      });
      try {
        localStorage.setItem('noor_bookings', JSON.stringify(bookings));
        sessionStorage.setItem('noor_booking_last', JSON.stringify({ id: bookingId, product: name || 'Your Package' }));
      } catch (ex) { /* storage blocked */ }
      window.location.href = 'booking_success.html';
    });
  }

  /* ---------------- booking_success.html ---------------- */
  function initBookingSuccess() {
    var last = null;
    try { last = JSON.parse(sessionStorage.getItem('noor_booking_last')); } catch (e) {}
    if (!last) { window.location.replace('index.html'); return; }
    setText('bsProduct', last.product || 'Your Package');
    setText('bsId', '#' + ('000000' + last.id).slice(-6));
    try { sessionStorage.removeItem('noor_booking_last'); } catch (e) {}
  }

  if (page === 'detail') initDetail();
  else if (page === 'product') initProduct();
  else if (page === 'booking') initBooking();
  else if (page === 'booking_success') initBookingSuccess();
})();
