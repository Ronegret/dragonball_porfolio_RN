import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Safe from "./components/Safe";
import { CONTACT } from "./data";
import "./fonts.css";
import "./index.css";

// último recurso si la app entera falla: una página mínima con el contacto, en vez de una pantalla en blanco
const fallback = (
  <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center", color: "#e8eefc", background: "#05070c", font: "16px/1.6 Inter, system-ui, sans-serif" }}>
    <div>
      <h1 style={{ margin: 0, fontSize: 28 }}>Rodrigo Negrete · AI Product Designer</h1>
      <p>Algo ha fallado al cargar la página. Recárgala o escríbeme directamente:</p>
      <p>
        <a style={{ color: "#ffcf2e" }} href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> ·{" "}
        <a style={{ color: "#ffcf2e" }} href={CONTACT.cv}>Ver mi CV</a>
      </p>
    </div>
  </main>
);

ReactDOM.createRoot(document.getElementById("root")!).render(<Safe fallback={fallback}><App /></Safe>);
