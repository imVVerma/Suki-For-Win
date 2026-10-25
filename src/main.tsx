import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import Dashboard from "./components/Dashboard";
import FloatingHud from "./components/FloatingHud";
import "./index.css";

const currentWindow = getCurrentWebviewWindow();
const isHud = currentWindow.label === "hud";

if (isHud) {
  document.documentElement.classList.add("hud-window");
  document.documentElement.style.background = "transparent";
  document.body.style.background = "transparent";
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    {isHud ? <FloatingHud /> : <Dashboard />}
  </StrictMode>
);
