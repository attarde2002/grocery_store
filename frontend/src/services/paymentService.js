import API from "./api";

const paymentService = {
  // Fetch all payment records for admin dashboard
  getAllPayments: async () => {
    const response = await API.get("/api/payments");
    return response.data; // Returns List<PaymentResponse>
  },

  // Process a new payment
  processPayment: async (paymentData) => {
    const response = await API.post("/api/payments", paymentData);
    return response.data;
  },

  // Fetch payment details by ID
  getPaymentById: async (paymentId) => {
    const response = await API.get(`/api/payments/${paymentId}`);
    return response.data;
  },

  // Fetch payment details by Order ID
  getPaymentByOrderId: async (orderId) => {
    const response = await API.get(`/api/payments/order/${orderId}`);
    return response.data;
  },

  // Matches PUT /api/payments/{orderId}/status?status=SUCCESS
  updatePaymentStatus: async (orderId, status) => {
    const response = await API.put(`/api/payments/${orderId}/status`, null, {
      params: { status }
    });
    return response.data;
  }
};

export default paymentService;