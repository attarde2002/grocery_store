// src/services/orderService.js
import API from "./api"; // Uses central Axios instance with JWT interceptor

// Place a new order (POST /api/orders)
export const placeOrder = async (orderRequest) => {
  console.log(orderRequest)
  const response = await API.post("/api/orders", orderRequest);
  return response.data;
};

// Fetch all orders in the system - Admin only (GET /api/orders)
export const getAllOrders = async () => {
  const response = await API.get("/api/orders");
  console.log(response.data)
  return response.data;
};

// Fetch all orders for a specific user (GET /api/orders/user/:userId)
export const getOrdersByUserId = async (userId) => {
  const response = await API.get(`/api/orders/user/${userId}`);
  return response.data;
};

// Update order status - Admin only (PUT /api/orders/:orderId/status?status=STATUS)
export const updateOrderStatus = async (orderId, newStatus) => {
  console.log(newStatus);
  const response = await API.put(`/api/orders/${orderId}/status`, null, {
    params: { status: newStatus },
  });
  return response.data;
};

// Cancel an order (PUT /api/orders/:orderId/cancel)
export const cancelOrder = async (orderId) => {
  const response = await API.put(`/api/orders/${orderId}/cancel`);
  return response.data;
};

export default {
  placeOrder,
  getAllOrders,
  getOrdersByUserId,
  updateOrderStatus,
  cancelOrder,
};