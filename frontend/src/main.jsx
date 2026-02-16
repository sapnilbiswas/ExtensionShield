import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import { initConfigValidation } from "./utils/configValidator";
import "./index.css";

// Google tag (gtag.js) - init runs from app bundle to satisfy CSP (no inline script)
window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() {
  window.dataLayer.push(arguments);
};
window.gtag("js", new Date());
window.gtag("config", "AW-17958351893");

// Validate configuration on app boot
initConfigValidation();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
