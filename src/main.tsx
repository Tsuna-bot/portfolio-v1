import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Message de console stylisé
console.log(
  "%c👨‍💻 Dev by Jeremy NAPHAY\n\n" +
    "%c🌐 Website: " +
    window.location.href +
    "\n\n" +
    "%c💼 LinkedIn: https://www.linkedin.com/in/jérémy-naphay/",
  "color: #ffa500; font-size: 12px; font-weight: bold; padding-bottom: 1rem;",
  "color: #ffa500; font-size: 10px;",
  "color: #ffa500; font-size: 10px;"
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
