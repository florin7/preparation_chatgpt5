import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "@/pages/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { PlansPage } from "@/pages/PlansPage";
import { BillingPage } from "@/pages/BillingPage";
import { AdminPage } from "@/pages/AdminPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "plans", element: <PlansPage /> },
      { path: "billing", element: <BillingPage /> },
      { path: "admin", element: <AdminPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
);
