var currentPage = 0;
const totalHtmlFiles = 1;

function applyMatterMattersSafariFixes() {
	var frame = document.getElementById("contentIFrame");
	if (!frame) return;

	try {
		var doc = frame.contentDocument || frame.contentWindow.document;
		if (!doc || !doc.head || doc.getElementById("matter-matters-safari-font-fix")) return;

		var style = doc.createElement("style");
		style.id = "matter-matters-safari-font-fix";
		style.textContent = "@font-face { font-family: 'coolvetica'; src: url('/fonts/coolvetica/Coolvetica%20Rg.otf') format('opentype'); font-style: normal; font-weight: 400; font-display: block; }\n" +
			"@font-face { font-family: 'coolvetica'; src: url('/fonts/coolvetica/Coolvetica%20Hv%20Comp.otf') format('opentype'); font-style: normal; font-weight: 700; font-display: block; }\n" +
			"html, body { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }\n" +
			"body, body * { font-family: 'coolvetica', Arial, sans-serif; font-synthesis: none; -webkit-font-smoothing: antialiased; }";
		doc.head.appendChild(style);
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
