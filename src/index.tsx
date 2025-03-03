import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./auth/auth";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {QueryClient, QueryClientProvider} from "react-query";

import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { router } from "./utils/Routes";


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
