import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Register from "../pages/auth/Register";
import SignIn from "../pages/auth/SignIn";
import PrivateRoute from "./privateRoute";
import Layout from "../components/common/Layout";
import AllUsers from "../pages/dashPages/AllUsers";
import AddFriends from "../pages/dashPages/AddFriends";
import ViewRequest from "../pages/dashPages/ViewRequest";
import Chat from "../pages/dashPages/Chat";
import UnFriends from "../pages/dashPages/UnFriends";
import SanckBar from "../pages/dashPages/SanckBar";

export const mainRouter = createBrowserRouter([
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },

  {
    path: "/",
    element: (
      // <PrivateRoute>
      <Layout />
      // </PrivateRoute>
    ),
    children: [
      {
        path: "/chat",
        element: <Chat />,
      },
      {
        path: "/add-friends",
        element: <AddFriends />,
      },
      {
        path: "/delete-friends",
        element: <UnFriends />,
      },
      {
        path: "/view-request",
        element: <ViewRequest />,
      },
      {
        path: "/snackbar",
        element: <SanckBar />,
      },
      {
        index: true,
        element: <AllUsers />,
      },
    ],
  },
]);
