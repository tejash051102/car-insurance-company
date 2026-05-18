import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Suppress third-party logger warnings and extension errors
if (typeof window !== "undefined") {
  // Suppress console warnings from logging libraries
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = String(args[0]);
    if (
      message.includes("DEFAULT") ||
      message.includes("root logger") ||
      message.includes("listener") ||
      message.includes("message channel closed")
    ) {
      return; // Suppress these warnings
    }
    originalWarn.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
