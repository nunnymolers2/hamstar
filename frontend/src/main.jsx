import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import RequireAuth from "./context/RequireAuth";
import AuthRedirect from "./components/Auth/AuthRedirect";

import "./assets/styles/index.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/auth/CreateListing";
import Listing from "./pages/Listing";
import Messaging from "./pages/Messaging";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "signup",
        element: (
          <AuthRedirect>
            <Signup />
          </AuthRedirect>
        ),
      },
      {
        path: "login",
        element: (
          <AuthRedirect>
            <Login />
          </AuthRedirect>
        ),
      },
      {
        path: "dashboard",
        element: (
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        ),
      },
      {
        path: "create-listing",
        element: (
          <RequireAuth>
            <CreateListing />
          </RequireAuth>
        ),
      },
      {
        path: "listings/:id", // Changed from 'listing' to 'listings/:id'
        element: <Listing />, // No auth requirement for viewing listings
      },
      {
        path: "messaging",
        element: (
          <RequireAuth>
            <Messaging />
          </RequireAuth>
        ),  
      },
    ],
  },
]);

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
