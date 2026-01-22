import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import { Provider } from "react-redux";
import store from "./store/index.js";

const container = document.getElementById("root")!;
if (!container) {
    throw new Error("Root container not found");
} else {
    createRoot(container).render(
        <StrictMode>
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
        </StrictMode>,
    );
}
