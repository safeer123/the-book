import React from "react";
import ReactDOM from "react-dom/client";
import RouterApp from "./router";
import { QueryClient, QueryClientProvider } from "react-query";

import "./styles.css";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);
const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterApp />
    </QueryClientProvider>
  </React.StrictMode>
);
