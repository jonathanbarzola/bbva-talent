// Anti-FOUC theme boot — applies user's saved theme to <html data-theme="..."> before first paint.
// Referenced from app/layout.tsx via <Script strategy="beforeInteractive">.
// Lives in public/ as a real file so the JSX in layout has no <script> tag,
// which keeps React 19 from emitting "scripts inside React components are never executed" warnings.
(function () {
  try {
    var t = localStorage.getItem("bbva-talent:theme");
    if (t === "light" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
