export const THEME_KEY = "autosure-theme";

export const getStoredTheme = () => {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem(THEME_KEY);
  return savedTheme === "dark" ? "dark" : "light";
};

export const applyTheme = (theme) => {
  if (typeof document === "undefined") return theme === "light" ? "light" : "dark";

  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.classList.toggle("light", nextTheme === "light");
  document.documentElement.classList.toggle("dark", nextTheme === "dark");

  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_KEY, nextTheme);
  }

  return nextTheme;
};
