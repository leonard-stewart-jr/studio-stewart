var currentPage = 0;
const totalHtmlFiles = 1;

function applyMatterMattersSafariFixes() {
	var frame = document.getElementById("contentIFrame");
	if (!frame) return;

	try {
		var doc = frame.contentDocument || frame.contentWindow.document;
		if (!doc || !doc.head) return;

		if (!doc.getElementById("matter-matters-safari-font-fix")) {
			var style = doc.createElement("style");
			style.id = "matter-matters-safari-font-fix";
			style.textContent =
				"@font-face { font-family: 'coolvetica'; src: url('/fonts/coolvetica/Coolvetica%20Rg.otf') format('opentype'); font-style: normal; font-weight: 400; font-display: block; }\n" +
				"@font-face { font-family: 'coolvetica'; src: url('/fonts/coolvetica/Coolvetica%20Bk.otf') format('opentype'); font-style: normal; font-weight: 500; font-display: block; }\n" +
				"@font-face { font-family: 'coolvetica'; src: url('/fonts/coolvetica/Coolvetica%20Hv%20Comp.otf') format('opentype'); font-style: normal; font-weight: 700 900; font-display: block; }\n" +
				"html, body { -webkit-text-size-adjust: none !important; text-size-adjust: none !important; }\n" +
				"body, p, span, div { max-height: 999999px; -webkit-text-size-adjust: none !important; text-size-adjust: none !important; font-synthesis: none !important; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }\n" +
				"span[class^='CharOverride-'] { font-family: 'coolvetica', Arial, sans-serif !important; font-kerning: none !important; font-feature-settings: 'kern' 0 !important; }\n" +
				"span.CharOverride-17, span.CharOverride-18 { font-family: 'Bungee Shade', 'coolvetica', Arial, sans-serif !important; }";
			doc.head.appendChild(style);
		}

		if (doc.fonts && doc.fonts.load) {
			doc.documentElement.classList.add("matter-font-loading");
			Promise.all([
				doc.fonts.load("506px coolvetica"),
				doc.fonts.load("798px coolvetica"),
				doc.fonts.ready
			]).then(function () {
				doc.documentElement.classList.remove("matter-font-loading");
				doc.body.offsetHeight;
			}).catch(function () {
				doc.documentElement.classList.remove("matter-font-loading");
			});
		}
	} catch (error) {
		// Same-origin iframe access can fail in unusual browser states. The page still loads normally.
	}
}

function changePublication() {
	if (currentPage >= 0 && currentPage < totalHtmlFiles) {
		var currentPageUrl = document.getElementById("contentIFrame").src;
		currentPageUrl = currentPageUrl.substring(0, currentPageUrl.lastIndexOf("/") + 1);
		var nextPageUrl = currentPageUrl;
		if (currentPage !== 0)
			currentPageUrl = currentPageUrl + "publication-" + currentPage + ".html";
		else
			currentPageUrl = currentPageUrl + "publication" + ".html";
		document.getElementById("contentIFrame").src = currentPageUrl;
		if ((currentPage + 1) < totalHtmlFiles) {
			nextPageUrl = nextPageUrl + "publication-" + (currentPage + 1) + ".html";
			document.getElementById("dummyIFrame").src = nextPageUrl;
		}
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
	applyMatterMattersSafariFixes();

	if (currentPage === 0) {
		document.getElementsByClassName("prev")[0].style.visibility = "hidden";
	} else {
		document.getElementsByClassName("prev")[0].style.visibility = "visible";
	}
	if (currentPage === (totalHtmlFiles -1)) {
		document.getElementsByClassName("next")[0].style.visibility = "hidden";
	} else {
		document.getElementsByClassName("next")[0].style.visibility = "visible";
	}
}
