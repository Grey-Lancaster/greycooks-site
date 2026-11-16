/* Floating "Cookbooks" button: back to this cookbook's home, switch cookbooks, or see them all. */
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
    "#cb-menu{display:none;position:absolute;left:0;bottom:50px;min-width:230px;background:#fffaf0;border:1px solid #d9c7a3;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.3);overflow:hidden}" +
    "#cb-switch.open #cb-menu{display:block}" +
    "#cb-menu a{display:block;padding:11px 16px;color:#3a2e26;text-decoration:none;border-bottom:1px solid #eadfc6}" +
    "#cb-menu a:last-child{border-bottom:0}" +
    "#cb-menu a:hover{background:#f3e6c8}" +
    "#cb-menu small{display:block;color:#8a7560;font-size:12px}" +
    "@media print{#cb-switch{display:none!important}}";
  document.head.appendChild(css);

  var box = document.createElement("div");
  box.id = "cb-switch";
  box.innerHTML =
    '<div id="cb-menu" role="menu">' +
    '<a href="' + here + '" role="menuitem">Top of this cookbook<small>' + hereName + "</small></a>" +
    '<a href="' + otherUrl + '" role="menuitem">Switch cookbook<small>Go to ' + otherName + "</small></a>" +
    '<a href="/" role="menuitem">All cookbooks<small>Pick from the main page</small></a>' +
    "</div>" +
    '<button type="button" aria-haspopup="true" aria-expanded="false">&#128214; Cookbooks</button>';
  document.body.appendChild(box);

  var btn = box.querySelector("button");
  function set(open) {
    box.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  btn.addEventListener("click", function (e) { e.stopPropagation(); set(!box.classList.contains("open")); });
  document.addEventListener("click", function () { set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
})();
