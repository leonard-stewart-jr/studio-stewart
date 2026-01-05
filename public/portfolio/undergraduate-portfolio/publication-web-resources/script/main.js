// ===== InDesign HTML export pager (original logic) =====
var currentPage = 0;
const totalHtmlFiles = 13;

function changePublication() {
  if (currentPage >= 0 && currentPage < totalHtmlFiles) {
    var currentPageUrl = document.getElementById("contentIFrame").src;
    currentPageUrl = currentPageUrl.substring(0, currentPageUrl.lastIndexOf("/") + 1);

    var nextPageUrl = currentPageUrl;

    if (currentPage !== 0) {
      currentPageUrl = currentPageUrl + "publication-" + currentPage + ".html";
    } else {
      currentPageUrl = currentPageUrl + "publication.html";
    }

    // Set the visible page
    var iframe = document.getElementById("contentIFrame");
    iframe.src = currentPageUrl;

    // Prefetch the next page in the hidden dummy iframe
    if ((currentPage + 1) < totalHtmlFiles) {
      nextPageUrl = nextPageUrl + "publication-" + (currentPage + 1) + ".html";
      document.getElementById("dummyIFrame").src = nextPageUrl;
    }

    // Fit the newly loaded page when the iframe finishes loading
    // (a single load listener is also attached during init; this call ensures a re-fit immediately after navigation)
    setTimeout(fitIframeStage, 60);
  }
}

function showNextPage() {
  ++currentPage;
  changePublication();
  showHideArrows();
}

function showPreviousPage() {
  --currentPage;
  changePublication();
  showHideArrows();
}

function showHideArrows() {
  if (currentPage === 0) {
    document.getElementsByClassName("prev")[0].style.visibility = "hidden";
  } else {
    document.getElementsByClassName("prev")[0].style.visibility = "visible";
  }
  if (currentPage === (totalHtmlFiles - 1)) {
    document.getElementsByClassName("next")[0].style.visibility = "hidden";
  } else {
    document.getElementsByClassName("next")[0].style.visibility = "visible";
  }
}

// ===== Responsive fit-to-viewport for each page in the iframe =====

// Visual padding around content (adjust if you embed under a site header later)
const SIDE_PADDING = 16; // px
const TOP_PADDING = 12;  // px

function findStageEl(doc) {
  // Choose the largest direct child of <body> (InDesign's "stage" container for the page)
  let best = null, maxArea = 0;
  const kids = Array.from(doc.body.children || []);
  for (const el of kids) {
    const r = el.getBoundingClientRect();
    const area = (r.width || 0) * (r.height || 0);
    if (area > maxArea) { maxArea = area; best = el; }
  }
  return best || doc.body.firstElementChild || doc.body;
}

function fitIframeStage() {
  try {
    var iframe = document.getElementById("contentIFrame");
    if (!iframe) return;

    // Same-origin: we can access the iframe document
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc || !doc.body) return;

    // Base styles inside the iframe to prevent margins/overflow issues
    doc.documentElement.style.background = "#ffffff";
    doc.body.style.margin = "0";
    doc.body.style.padding = "0";
    doc.body.style.overflow = "hidden";

    // Find the stage and reset transform before measuring
    const stage = findStageEl(doc);
    if (!stage) return;

    stage.style.transformOrigin = "top center";
    stage.style.transform = "translate(0px, 0px) scale(1)";

    // Intrinsic size of the stage (fallback to common page sizes if not measurable)
    const intrinsicW =
      stage.offsetWidth ||
      stage.getBoundingClientRect().width ||
      parseFloat(doc.body.style.width) ||
      612;
    const intrinsicH =
      stage.offsetHeight ||
      stage.getBoundingClientRect().height ||
      parseFloat(doc.body.style.height) ||
      792;

    // Viewport (outer window hosting the iframe)
    const vw = Math.max(320, window.innerWidth || 320);
    const vh = Math.max(320, window.innerHeight || 320);

    // Compute scale to fit both width and height (keep aspect ratio)
    const fitW = (vw - SIDE_PADDING * 2) / intrinsicW;
    const fitH = (vh - TOP_PADDING) / intrinsicH;
    const scale = Math.max(0.1, Math.min(fitW, fitH));

    const scaledW = Math.ceil(intrinsicW * scale);
    const scaledH = Math.ceil(intrinsicH * scale);

    // Apply scale and center via left/top offsets
    stage.style.transform = "translate(0px, 0px) scale(" + scale + ")";
    stage.style.left = Math.max(0, Math.floor((vw - scaledW) / 2)) + "px";
    stage.style.top  = Math.max(0, Math.floor((vh - scaledH) / 2)) + "px";

    // Expand the iframe's inner document to viewport so sizing works
    doc.body.style.width = vw + "px";
    doc.body.style.height = vh + "px";

    // Optionally size the outer iframe to the scaled content (keeps scroll behavior clean)
    iframe.style.width  = Math.min(vw - SIDE_PADDING * 2, scaledW) + "px";
    iframe.style.height = Math.min(vh - TOP_PADDING,   scaledH) + "px";

    // Fonts load may change metrics; re-fit once fonts are ready
    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(function () { setTimeout(fitIframeStage, 50); });
    }
  } catch (e) {
    console.warn("fitIframeStage error:", e);
  }
}

// Attach once and keep re-fitting when needed
(function initResponsiveFit() {
  function onReady() {
    var iframe = document.getElementById("contentIFrame");
    if (iframe) {
      // Re-fit whenever a new page loads in the iframe
      iframe.addEventListener("load", function () {
        setTimeout(fitIframeStage, 50);
      });
      // Initial fit in case the first page is already loaded
      setTimeout(fitIframeStage, 120);
    }

    // Re-fit on window resize
    window.addEventListener("resize", fitIframeStage);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    onReady();
  } else {
    window.addEventListener("DOMContentLoaded", onReady, { once: true });
  }
})();