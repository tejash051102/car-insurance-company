// Suppress third-party logger warnings IMMEDIATELY before any imports
if (typeof window !== "undefined") {
  const originalLog = console.log;
  const originalWarn = console.warn;
  
  // Filter both log and warn for problematic messages
  const shouldSuppress = (message) => {
    const msg = String(message || "");
    return msg.includes("[DEFAULT]") || 
           msg.includes("root logger") || 
           msg.includes("listener") || 
           msg.includes("message channel");
  };

  console.log = (...args) => {
    if (!shouldSuppress(args[0])) {
      originalLog.apply(console, args);
    }
  };

  console.warn = (...args) => {
    if (!shouldSuppress(args[0])) {
      originalWarn.apply(console, args);
    }
  };
}

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
