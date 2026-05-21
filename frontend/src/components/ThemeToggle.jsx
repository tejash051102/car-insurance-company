import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { applyTheme, getStoredTheme } from "../utils/theme.js";

const ThemeToggle = ({ className = "" }) => {
  const [theme, setTheme] = useState(getStoredTheme);
  const isLight = theme === "light";

  const toggleTheme = () => {
    setTheme(applyTheme(isLight ? "dark" : "light"));
  };

  return (
    <button
      className={className}
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

export default ThemeToggle;
