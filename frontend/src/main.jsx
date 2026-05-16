import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Debug: Show we're loading
console.log("✅ main.jsx loading...");

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#04080f",
          color: "#fff",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "20px",
        }}>
          <h1>⚠️ Something went wrong</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "10px", maxWidth: "400px", wordBreak: "break-word" }}>
            {this.state.error?.message || "Unknown error"}
          </p>
          <pre style={{ background: "rgba(0,0,0,0.5)", padding: "10px", borderRadius: "4px", fontSize: "12px", color: "#ff6b6b", maxWidth: "500px", overflow: "auto" }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#0ea5e9",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById("root");
console.log("✅ Root element found:", !!root);

try {
  console.log("✅ Creating React root...");
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <HashRouter>
          <App />
        </HashRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log("✅ React app rendered successfully");
} catch (err) {
  console.error("❌ Failed to render app:", err);
  root.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">
    Error rendering app: ${err.message}
    <pre>${err.stack}</pre>
  </div>`;
}
