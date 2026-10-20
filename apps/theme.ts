export type ThemePreference = "system" | "light" | "dark";

const storageKey = "web-components.theme";

export const themeBootstrapScript = `(() => {
  let theme = "system";
  try {
    const saved = localStorage.getItem("web-components.theme");
    if (saved === "light" || saved === "dark") theme = saved;
  } catch {}
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches));
})();`;

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(storageKey);
    if (value === "light" || value === "dark") return value;
  } catch {}
  return "system";
}

export function mountThemeControl(select: HTMLSelectElement) {
  const media = matchMedia("(prefers-color-scheme: dark)");
  let preference = readPreference();
  const apply = () => {
    document.documentElement.dataset.theme = preference;
    document.documentElement.classList.toggle(
      "dark",
      preference === "dark" || (preference === "system" && media.matches),
    );
    select.value = preference;
  };
  const change = () => {
    preference =
      select.value === "light" || select.value === "dark"
        ? select.value
        : "system";
    try {
      localStorage.setItem(storageKey, preference);
    } catch {}
    apply();
  };
  const storage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      preference = readPreference();
      apply();
    }
  };
  apply();
  select.addEventListener("change", change);
  media.addEventListener("change", apply);
  window.addEventListener("storage", storage);
  return () => {
    select.removeEventListener("change", change);
    media.removeEventListener("change", apply);
    window.removeEventListener("storage", storage);
  };
}
