/* Floating "Cookbooks" button: same/similar recipe in the other cookbook, top of this cookbook,
   switch cookbooks, or all cookbooks. Recipe pairs come from /cookbook-map.json. */
(function () {
  if (document.getElementById("cb-switch")) return;
  var inPapa = location.pathname.indexOf("/papalanc/") === 0;
  var here = inPapa ? "/papalanc/" : "/grey/";
  var hereName = inPapa ? "Papa Lanc's Cookbook" : "Grey's Cook Book";
  var otherUrl = inPapa ? "/grey/" : "/papalanc/";
  var otherName = inPapa ? "Grey's Cook Book" : "Papa Lanc's Cookbook";

  var css = document.createElement("style");
  css.textContent =
    "#cb-switch{position:fixed;left:16px;bottom:18px;z-index:1000;font:15px Georgia,'Times New Roman',serif}" +
    "#cb-switch button{background:#7a3b1e;color:#fff;border:0;border-radius:22px;padding:10px 16px;font:inherit;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.35);opacity:.92}" +
    "#cb-switch button:hover{opacity:1}" +
    "#cb-menu{display:none;position:absolute;left:0;bottom:50px;width:260px;max-width:calc(100vw - 32px);background:#fffaf0;border:1px solid #d9c7a3;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.3);overflow:hidden}" +
    "#cb-switch.open #cb-menu{display:block}" +
    "#cb-menu a{display:block;padding:11px 16px;color:#3a2e26;text-decoration:none;border-bottom:1px solid #eadfc6}" +
    "#cb-menu a:last-child{border-bottom:0}" +
    "#cb-menu a:hover{background:#f3e6c8}" +
    "#cb-menu a.match{background:#f6e9c9;font-weight:bold}" +
    "#cb-menu small{display:block;color:#8a7560;font-size:12px;font-weight:normal}" +
    "@media print{#cb-switch{display:none!important}}";
  document.head.appendChild(css);

  var box = document.createElement("div");
  box.id = "cb-switch";
  box.innerHTML =
    '<div id="cb-menu" role="menu"></div>' +
    '<button type="button" aria-haspopup="true" aria-expanded="false">&#128214; Cookbooks</button>';
  document.body.appendChild(box);
  var menu = box.querySelector("#cb-menu");
  var btn = box.querySelector("button");

  var map = null, mapLoading = false;
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  function currentGreyId() {
    var cards = document.querySelectorAll(".recipe-card[id]"), pick = null, i;
    for (i = 0; i < cards.length; i++) {
      if (cards[i].getBoundingClientRect().top <= window.innerHeight * 0.4) pick = cards[i].id;
    }
    if (!pick && location.hash) {
      var h = decodeURIComponent(location.hash.slice(1));
      for (i = 0; i < cards.length; i++) if (cards[i].id === h) pick = h;
    }
    return pick;
  }

  function matches() {
    if (!map) return [];
    if (inPapa) return map.papa[decodeURIComponent(location.pathname)] || [];
    var id = currentGreyId();
    return (id && map.grey[id]) || [];
  }

  function render() {
    var html = "", m = matches().slice(0, 4), i;
    for (i = 0; i < m.length; i++) {
      html += '<a class="match" href="' + esc(m[i].u) + '" role="menuitem">' +
        (m[i].k === "same" ? "Same recipe in " : "Similar recipe in ") + esc(otherName) +
        "<small>" + esc(m[i].t) + "</small></a>";
    }
    html +=
      '<a href="' + here + '" role="menuitem">Top of this cookbook<small>' + esc(hereName) + "</small></a>" +
      '<a href="' + otherUrl + '" role="menuitem">Switch cookbook<small>Go to ' + esc(otherName) + "</small></a>" +
      '<a href="/" role="menuitem">All cookbooks<small>Pick from the main page</small></a>';
    menu.innerHTML = html;
  }

  function loadMap(cb) {
    if (map) return cb();
    if (mapLoading) return;
    mapLoading = true;
    fetch("/cookbook-map.json").then(function (r) { return r.json(); })
      .then(function (d) { map = d; cb(); })
      .catch(function () { mapLoading = false; cb(); });
  }

  function set(open) {
    box.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  render();
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = !box.classList.contains("open");
    if (open) { render(); loadMap(render); }
    set(open);
  });
  menu.addEventListener("click", function (e) { e.stopPropagation(); });
  document.addEventListener("click", function () { set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
})();
