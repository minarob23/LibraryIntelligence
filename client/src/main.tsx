import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Only log meaningful errors, filter out empty objects
  if (event.reason && Object.keys(event.reason).length > 0) {
    console.error('Unhandled promise rejection:', event.reason);
  }
  event.preventDefault(); // Prevent the default browser behavior
});

// Handle uncaught errors
window.addEventListener('error', (event) => {
  if (event.error && Object.keys(event.error).length > 0) {
    console.error('Uncaught error:', event.error);
  }
});

createRoot(document.getElementById("root")!).render(<App />);