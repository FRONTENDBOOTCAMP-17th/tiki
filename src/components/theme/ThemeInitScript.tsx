import { THEME_STORAGE_KEY } from "./theme";

const themeInitScript = `
(function() {
  try {
    var storageKey = "${THEME_STORAGE_KEY}";
    var savedTheme = localStorage.getItem(storageKey);
    var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : systemTheme;

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
})();
`;

export default function ThemeInitScript() {
  return (
    <script
      id="tiki-theme-init"
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  );
}

