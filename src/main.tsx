import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Raiz from "./Raiz.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Raiz />
    </AuthProvider>
  </StrictMode>,
);
