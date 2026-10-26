/* =========================================================
   main.js — shared behaviour for the static Noor e Mehal site
   Replaces what PHP sessions / forms used to do.
   NOTE: this is a front-end demo layer (localStorage only).
   Nothing here is sent to a server.
   ========================================================= */
(function () {
  'use strict';

  var LS_USERS = 'noor_users';
  var LS_CURRENT = 'noor_current_user';
  var SS_REDIRECT = 'noor_redirect_after_login';

  function load(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked */ }
  }

  function showMsg(id, text) {
    var el = document.getElementById(id);
    if (!el) return;
    var target = el.querySelector('span') || el;
    target.textContent = text;
    el.style.display = '';
    if (el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function hideMsg(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  function hashPassword(pw) {
    var text = 'noor-e-mehal:' + pw;
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ('0' + b.toString(16)).slice(-2);
        }).join('');
      });
    }
    var h = 5381;
    for (var i = 0; i < text.length; i++) { h = ((h << 5) + h + text.charCodeAt(i)) | 0; }
    return Promise.resolve('x' + (h >>> 0).toString(16));
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---------- navbar: show user name + logout when "logged in" ---------- */
  function renderNav() {
    var user = load(LS_CURRENT, null);
    var box = document.querySelector('.nav-actions');
    if (!box || !user) return;
    box.innerHTML =
      '<a href="#" class="btn btn-outline" data-logout><i class="fas fa-sign-out-alt"></i> Logout</a>' +
      '<a href="index.html" class="btn btn-primary"><i class="fas fa-user"></i> <span class="js-user-name"></span></a>';
    box.querySelector('.js-user-name').textContent = user.name || 'My Account';
    box.querySelector('[data-logout]').addEventListener('click', function (e) {
      e.preventDefault();
      try { localStorage.removeItem(LS_CURRENT); } catch (err) {}
      window.location.href = 'index.html';
    });
  }

  /* ---------- login ---------- */
  function initLogin() {
    var form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideMsg('formError');
      var email = form.elements['email'].value.trim().toLowerCase();
      var password = form.elements['password'].value;
      if (!email || !password) { showMsg('formError', 'Please fill all fields'); return; }
      hashPassword(password).then(function (h) {
        var user = load(LS_USERS, []).filter(function (u) { return u.email === email && u.hash === h; })[0];
        if (!user) { showMsg('formError', 'Invalid email or password'); return; }
        save(LS_CURRENT, { name: user.name, email: user.email, phone: user.phone || '' });
        var back = null;
        try { back = sessionStorage.getItem(SS_REDIRECT); sessionStorage.removeItem(SS_REDIRECT); } catch (err) {}
        window.location.href = back || 'index.html';
      });
    });
  }

  /* ---------- register ---------- */
  function initRegister() {
    var form = document.getElementById('registerForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideMsg('formError'); hideMsg('formSuccess');
      var f = form.elements;
      var name = f['full_name'].value.trim();
      var email = f['email'].value.trim().toLowerCase();
      var pw = f['password'].value;
      var pw2 = f['confirm_password'].value;
      var phone = f['phone'].value.trim();
      var address = f['address'].value.trim();

      if (!name || !email || !pw) { showMsg('formError', 'Please fill all required fields'); return; }
      if (pw !== pw2) { showMsg('formError', 'Passwords do not match'); return; }
      if (pw.length < 6) { showMsg('formError', 'Password must be at least 6 characters'); return; }

      var users = load(LS_USERS, []);
      if (users.some(function (u) { return u.email === email; })) {
        showMsg('formError', 'Email already registered'); return;
      }
      hashPassword(pw).then(function (h) {
        users.push({ name: name, email: email, hash: h, phone: phone, address: address });
        save(LS_USERS, users);
        form.reset();
        showMsg('formSuccess', 'Registration successful! Please login.');
        setTimeout(function () { window.location.href = 'login.html'; }, 2000);
      });
    });
  }

  /* ---------- contact / inquiry ---------- */
  function initContact() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideMsg('formError'); hideMsg('formSuccess');
      var f = form.elements;
      var name = f['full_name'].value.trim();
      var phone = f['phone'].value.trim();
      var email = f['email'].value.trim();
      if (!name || !phone || !email) {
        showMsg('formError', '\u274C Please fill all required fields (Name, Phone, Email)'); return;
      }
      if (!EMAIL_RE.test(email)) {
        showMsg('formError', '\u274C Please enter a valid email address'); return;
      }
      form.reset();
      showMsg('formSuccess', '\u2705 Thank you for contacting us! We will get back to you soon.');
    });
  }

  /* ---------- footer year ---------- */
  function setYear() {
    var y = String(new Date().getFullYear());
    Array.prototype.forEach.call(document.querySelectorAll('.js-year'), function (el) { el.textContent = y; });
  }

  function init() {
    renderNav();
    initLogin();
    initRegister();
    initContact();
    setYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
