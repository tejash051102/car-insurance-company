import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { applyTheme, getStoredTheme } from "./utils/theme.js";

applyTheme(getStoredTheme());

try {
  window.history.replaceState(null, "", window.location.href);
} catch {
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
