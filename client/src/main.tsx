import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeParksData } from "@shared/parks-data";

// Initialize parks data on application startup
initializeParksData();

createRoot(document.getElementById("root")!).render(<App />);
