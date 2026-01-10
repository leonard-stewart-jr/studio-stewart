// Show only one Artboard per page based on ?ab=1|2.
// Works with ai2html wrappers like "<div id='fall2024-Artboard_1'>"
// and "<div id='g-fall2024-Artboard_1'>", and falls back to hiding
// <img> tags whose src contains "-Artboard_1" or "-Artboard_2".
(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    try {
      var params = new URLSearchParams(window.location.search);
      var ab = params.get("ab") === "2" ? "2" : "1";

      // Determine page slug from the current filename (e.g., "fall2024")
      var m = location.pathname.match(/\/([^\/]+)\.html$/);
      var slug = m ? m[1] : "";

      // Prefer hiding/showing Artboard wrapper elements by id
      var a1 =
        document.getElementById(slug + "-Artboard_1") ||
        document.getElementById("g-" + slug + "-Artboard_1");
      var a2 =
        document.getElementById(slug + "-Artboard_2") ||
        document.getElementById("g-" + slug + "-Artboard_2");

      function hide(el) {
        if (el && el.style) el.style.display = "none";
      }
      function show(el) {
        if (el && el.style) el.style.display = "";
      }

      if (a1 || a2) {
        if (ab === "1") {
          show(a1);
          hide(a2);
        } else {
          show(a2);
          hide(a1);
        }
        return;
      }

      // Fallback: hide images matching Artboard filenames
      var imgs = Array.prototype.slice.call(document.querySelectorAll("img"));
      var re1 = /-Artboard_1\.(png|jpg|jpeg|webp)$/i;
      var re2 = /-Artboard_2\.(png|jpg|jpeg|webp)$/i;

      imgs.forEach(function (img) {
        var p = "";
        try {
          p = new URL(img.src, location.href).pathname;
        } catch (_) {
          p = img.src || "";
        }
        if (ab === "1") {
          if (re2.test(p)) hide(img);
        } else {
          if (re1.test(p)) hide(img);
        }
      });

      // Optional: hide parents of hidden images to avoid empty gaps (ai2html often wraps each Artboard)
      // Uncomment if needed:
      // imgs.forEach(function (img) {
      //   if (img.style.display === "none" && img.parentElement) {
      //     var parent = img.parentElement;
      //     if (parent && parent.children && parent.children.length === 1) {
      //       parent.style.display = "none";
      //     }
      //   }
      // });
    } catch (e) {
      console.warn("ab-toggle.js error:", e);
    }
  });
})();
