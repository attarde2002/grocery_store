import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Product Pages
import ProductList from "../pages/products/ProductList";
import ProductDetailsPage from "../pages/products/ProductDetailsPage";
import AddProductPage from "../pages/products/AddProductPage";

// Admin Management Pages
import InventoryPage from "../pages/inventory/InventoryPage";
import CategoryManagementPage from "../pages/categories/CategoryManagementPage";
import PaymentDashboard from "../pages/admin/PaymentDashboard"; // Imported Payment Dashboard

// Cart & Order Pages
import CartPage from "../pages/cart/CartPage";
import CheckoutPage from "../pages/cart/CheckoutPage";
import MyOrdersPage from "../pages/orders/MyOrdersPage";

// Protected Route Guard
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<ProductList />} />

        {/* ADMIN ROUTES: Must be placed BEFORE /products/:id */}
        <Route
          path="/products/add"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <CategoryManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <PaymentDashboard />
            </ProtectedRoute>
          }
        />

        {/* DYNAMIC PARAMETER ROUTES */}
        <Route path="/products/:id" element={<ProductDetailsPage />} />

        {/* Protected Customer Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Route>
    </Routes>
  );
}