(function () {
// Images: show the drafting-paper placeholder until an image loads.
document.querySelectorAll('.media img').forEach(function (img) {
  var box = img.closest('.media');
  function ok() { box.classList.add('has-img'); }
  function bad() { img.remove(); }
  if (img.complete && img.naturalWidth) ok();
  else if (img.complete) bad();
  img.addEventListener('load', ok);
  img.addEventListener('error', bad);
});

// Header border on scroll
var head = document.querySelector('.site-head');
function onScroll() { if (head) head.classList.toggle('scrolled', window.scrollY > 8); }
window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

// Make the hero dimension line match the name's width
var heroName = document.querySelector('.name'), dim = document.querySelector('.dim');
function fit() { if (heroName && dim) dim.style.setProperty('--namew', heroName.getBoundingClientRect().width + 'px'); }
window.addEventListener('resize', fit);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
fit();

// Photography: hide empty slots once at least one photo exists, and open photos full size
var photos = document.querySelector('.photos');
if (photos) {
  var figs = photos.querySelectorAll('figure');
  function tidy() {
    // only hide a slot whose image is missing or failed, never one that is still loading
    figs.forEach(function (f) { var i = f.querySelector('.media img'); f.hidden = !i || (i.complete && !i.naturalWidth && !i.loading); });
  }
  photos.addEventListener('error', function(){ setTimeout(tidy, 0); }, true);
  window.addEventListener('load', tidy);
  var lb = document.querySelector('.lightbox');
  var btns = Array.prototype.slice.call(photos.querySelectorAll('.ph-btn'));
  var cur = 0;
  function visible() {
    return btns.filter(function (b) { var f = b.closest('figure'); return !(f && f.hidden); })
      .sort(function (a, b) { return (parseInt(a.closest('figure').style.order, 10) || 0) - (parseInt(b.closest('figure').style.order, 10) || 0); });
  }
  function show(i) {
    var list = visible(); if (!list.length) return;
    cur = (i + list.length) % list.length;
    var b = list[cur], img = b.querySelector('img'), big = lb.querySelector('img');
    big.src = img.dataset.full || img.src; big.alt = img.alt;
    var cap = b.parentElement.querySelector('figcaption');
    lb.querySelector('.lb-cap').textContent = cap ? cap.textContent : '';
    lb.querySelector('.lb-count').textContent = (cur + 1) + ' / ' + list.length;
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (!lb || !lb.showModal) return;
      show(visible().indexOf(b));
      lb.showModal();
    });
  });
  if (lb) {
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
    });
    var sx = null, sy = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(dx < 0 ? cur + 1 : cur - 1);
      sx = null;
    });
  }
}

// Contact form (FormSubmit: messages go to the portfolio owner's email)
var form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = form.querySelector('.status');
    status.className = 'status';
    if (!form.checkValidity()) {
      status.className = 'status err';
      status.textContent = 'Please add your name, a valid email and a message.';
      var bad = form.querySelector(':invalid'); if (bad) bad.focus();
      return;
    }
    var btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    status.textContent = 'Sending…';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok || String(d.success) !== 'true') throw new Error(); }); })
      .then(function () {
        form.reset();
        status.textContent = 'Message sent. Thanks, I’ll be in touch soon.';
      })
      .catch(function () {
        status.className = 'status err';
        status.innerHTML = 'Your message didn’t send. Please email me at <a href="mailto:otulana55@gmail.com">otulana55@gmail.com</a>.';
      })
      .then(function () { btn.disabled = false; });
  });
}

var y = document.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();

})();

// hero art: simple shapes that keep rearranging into new compositions on a grid
(function(){
  var svg = document.querySelector('.hero-art .comp'); if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  function el(t, a, p){ var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
  var grid = el('g', {opacity:.5});
  for (var i = 0; i <= 4; i++) { el('line', {x1:i*100, y1:0, x2:i*100, y2:400, stroke:'#C6CBC3', 'stroke-width':1}, grid); el('line', {x1:0, y1:i*100, x2:400, y2:i*100, stroke:'#C6CBC3', 'stroke-width':1}, grid); }
  // each shape is drawn in a 100 x 100 cell centred on 0,0
  var defs = [
    {f:'#2B45E0', d:'<circle r="50"/>'},
    {f:'#1A1D21', d:'<rect x="-50" y="-50" width="100" height="100"/>'},
    {f:'#E34A2B', d:'<path d="M-50,50 V-50 A100,100 0 0 1 50,50 Z"/>'},
    {f:'#DCE3FB', d:'<path d="M-50,0 A50,50 0 0 1 50,0 Z"/>'},
    {f:'#2B45E0', d:'<path d="M-50,50 L50,50 L-50,-50 Z"/>'},
    {f:'#1A1D21', d:'<circle r="14"/>'}
  ];
  var shapes = defs.map(function(s){ var g = el('g', {}); g.innerHTML = s.d; g.firstChild.setAttribute('fill', s.f); return g; });
  // layouts: [col, row, rotation, scale] for each shape (cells are 100px)
  var L = [
    [[1,1,0,1],[2,2,0,1],[2,1,0,1],[1,2,180,1],[3,3,0,1],[0,3,0,1]],
    [[2,2,0,2],[0,0,0,1],[3,0,90,1],[1,3,0,2],[0,2,270,1],[3,3,0,1]],
    [[0,1,0,1],[1,1,0,1],[2,1,90,2],[0,2,0,2],[3,3,180,1],[1,0,0,1]],
    [[3,2,0,1],[1,2,45,1],[0,0,0,2],[2,3,90,1],[2,1,90,1],[3,0,0,1]]
  ];
  var HOLD = 2.2, MOVE = 1.1, CYC = HOLD + MOVE;
  var ease = function(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2; };
  var back = function(t){ var c1 = 1.5, c3 = c1 + 1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); };
  function pos(l){ var s = l[3]; return {x: l[0]*100 + 50*s, y: l[1]*100 + 50*s, r: l[2], s: s}; }
  function draw(t){
    var n = Math.floor(t / CYC), u = t - n*CYC, a = L[n % L.length], b = L[(n + 1) % L.length];
    shapes.forEach(function(g, i){
      var k = u < HOLD ? 0 : Math.min(1, Math.max(0, (u - HOLD - i*0.06) / (MOVE - 0.3)));
      var e = back(ease(k) * 0 + k) , p = pos(a[i]), q = pos(b[i]);
      var ke = k < 1 ? back(k) : 1;
      var x = p.x + (q.x - p.x)*ke, y = p.y + (q.y - p.y)*ke, r = p.r + (q.r - p.r)*ease(k), s = p.s + (q.s - p.s)*ke;
      g.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + s + ')');
    });
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // intro: shapes pop in one by one
  var t0 = null;
  function frame(now){ if (t0 === null) t0 = now; var t = (now - t0)/1000;
    draw(t);
    shapes.forEach(function(g, i){ var k = Math.min(1, Math.max(0, (t - 0.3 - i*0.12) / 0.6)); g.style.opacity = k;
      if (k < 1) g.setAttribute('transform', g.getAttribute('transform') + ' scale(' + back(k) + ')'); });
    requestAnimationFrame(frame); }
  if (reduce) draw(0); else requestAnimationFrame(frame);
  window.__comp = {draw: draw};
})();
