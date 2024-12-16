import MainLayout from "@/components/layout/MainLayout";
import ResetPassword from "@/views/auth/ResetPassword";
import VerifyAccount from "@/views/auth/VerifyAccount";
import About from "@/views/about";
import Cart from "@/views/cart";
import Home from "@/views/home";
import ProductDetail from "@/views/productDetail";
import { createBrowserRouter, redirect } from "react-router-dom";
import MyProfile from "@/views/profile";
import ProfileLayout from "@/components/layout/ProfileLayout";
import ProfileAddress from "@/views/profile/ProfileAddress";
import { redirectIfAuthenticated, requireAuth } from "./loader";
import Order from "@/views/order";
import Product from "@/views/product";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/verify-account",
        element: <VerifyAccount />,
        loader: redirectIfAuthenticated, 
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
        loader: redirectIfAuthenticated, 
      },
      {
        element: <ProfileLayout />,
        children: [
          {
            path: "/profile",
            element: <MyProfile titlePage="Profile" />,
            loader: requireAuth, 
          },
          {
            path: "/profile/address",
            element: <ProfileAddress titlePage="My Address" />,
            loader: requireAuth, 
          },
        ],
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/cart",
        element: <Cart />,
        loader: requireAuth, 
      },
      {
        path: "/order",
        element: <Order />,
        loader: requireAuth, 
      },
      
      {
        path: "/product",
        children: [
          {
            path: "",
            element: <Product />,
          },
          {
            path: ":productId",
            element: <ProductDetail />,
          },
        ],
      },
      {
        path: "*",
        loader: () => redirect("/"),
      },
    ],
  },
]);
