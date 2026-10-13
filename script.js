/* ============================================================
   Law Offices of Victoria Clemans — Site JavaScript
   Handles nav, sticky header, _page field, and AJAX form submit.
   ============================================================ */
(function () {
  'use strict';

  var FORM_URL = 'https://vision.leadrai.com/api/forms/9e590f53463b0b3fe52be4a6092a18fc';

  document.addEventListener('DOMContentLoaded', function () {
    /* ---------- Current year ---------- */
    var yearEl = document.getElementById('year');
    if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

    /* ---------- Sticky header shadow ---------- */
    var header = document.getElementById('site-header');
    if (header) {
      var onScroll = function () {
        if (window.scrollY > 8) { header.classList.add('is-stuck'); }
        else { header.classList.remove('is-stuck'); }
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------- Mobile navigation ---------- */
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.tagName === 'A' && nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    /* ---------- Populate every _page field with the current URL ---------- */
    var pageFields = document.querySelectorAll('input[name="_page"]');
    for (var i = 0; i < pageFields.length; i++) {
      pageFields[i].value = window.location.href;
    }

    /* ---------- Show confirmation when returning with ?submitted=1 ---------- */
    if (new URLSearchParams(window.location.search).get('submitted') === '1') {
      showSuccess();
    }

    /* ---------- AJAX submission for the contact form ---------- */
    var form = document.getElementById('contact-form');
    if (!form) { return; }

    var statusEl = document.getElementById('form-status');
    var submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', function (e) {
      // Respect native validation first.
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        return; // let the browser show validation messages
      }
      if (!window.fetch) { return; } // fall back to a normal POST

      e.preventDefault();

      // Keep the hidden _page field in sync with the live URL.
      for (var j = 0; j < pageFields.length; j++) {
        pageFields[j].value = window.location.href;
      }

      // Build a JSON payload from all named fields (includes _form, _page, _gotcha).
      var data = {};
      var fd = new FormData(form);
      fd.forEach(function (value, key) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          data[key] = data[key] + ', ' + value;
        } else {
          data[key] = value;
        }
      });
      data._page = window.location.href;

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending\u2026'; }
      hideStatus(statusEl);

      fetch(FORM_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json().catch(function () { return { ok: res.ok }; });
        })
        .then(function (json) {
          if (json && json.ok) {
            showSuccess();
            form.reset();
          } else {
            throw new Error('Submission was not accepted');
          }
        })
        .catch(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send My Message'; }
          showStatus(statusEl, 'Sorry, something went wrong. Please call us at (310) 488-6357 or email vclemansesq@ca.rr.com.', false);
        });
    });

    function showSuccess() {
      var wrap = document.getElementById('form-success');
      if (form) { form.hidden = true; }
      if (wrap) {
        wrap.hidden = false;
        wrap.setAttribute('tabindex', '-1');
        try { wrap.focus(); } catch (err) {}
        if (wrap.scrollIntoView) {
          wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    function showStatus(el, msg, ok) {
      if (!el) { return; }
      el.textContent = msg;
      el.className = 'form-status' + (ok ? ' is-ok' : '');
      el.hidden = false;
    }
    function hideStatus(el) {
      if (el) { el.hidden = true; el.textContent = ''; }
    }
  });
})();
