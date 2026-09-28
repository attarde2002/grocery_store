import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../services/api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems = [], clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  // Default to COD
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const isProcessing = useRef(false);

  const safeSubtotal = cartItems.reduce((sum, item) => {
    if (!item) return sum;
    const price = Number(item.price ?? item.product?.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return sum + price * quantity;
  }, 0);

  const shippingFee = safeSubtotal > 50 || cartItems.length === 0 ? 0 : 4.99;
  const estimatedTax = safeSubtotal * 0.05;
  const finalTotal = safeSubtotal + shippingFee + estimatedTax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing.current || loading) return;

    isProcessing.current = true;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const currentUserId = user?.userId || user?.id || localStorage.getItem("userId");

      if (!token || !currentUserId) {
        alert("Authentication details missing. Please log in again.");
        navigate("/login");
        return;
      }

      const orderItems = cartItems.map((item) => ({
        productId: item.id ?? item.productId ?? item.product?.id,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price ?? item.product?.price) || 0,
      }));

      // Map paymentMethod cleanly for backend compatibility
      const selectedPaymentMethod = paymentMethod === "COD" ? "COD" : "UPI";

      const orderPayload = {
        items: orderItems,
        totalAmount: Number(finalTotal.toFixed(2)),
        // Sending standard field names commonly expected by Java DTOs
        paymentMethod: selectedPaymentMethod, 
        paymentMode: selectedPaymentMethod,
        paymentType: selectedPaymentMethod
      };

      console.log("Submitting order payload:", orderPayload);

      // Single API call: Backend handles order and internal payment call via Feign
      const orderResponse = await API.post("/api/orders", orderPayload);
      const orderData = orderResponse.data;
      const createdOrderId = orderData?.orderId || orderData?.id;

      if (!orderData || !createdOrderId) {
        throw new Error("Order creation failed. Invalid response from Order Service.");
      }

      if (clearCart) clearCart();
      alert(`Order #${createdOrderId} placed successfully via ${selectedPaymentMethod}!`);
      navigate("/orders");

    } catch (err) {
      console.error("Checkout transaction error:", err);
      const errorMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response?.data : null) ||
        err.message ||
        "Transaction failed.";
      alert(errorMessage);
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  if (!cartItems.length) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold mb-3">Your cart is empty</h4>
        <Link to="/products" className="btn btn-success rounded-pill px-4">
          <FaArrowLeft className="me-2" /> Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "800px" }}>
        <h2 className="fw-bold mb-4">Complete Your Order</h2>
        <form onSubmit={handleSubmit} className="row g-4">
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold mb-3">Payment Method</h5>
              
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="cod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label fw-semibold" htmlFor="cod">
                  Cash on Delivery (COD)
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="upi"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label fw-semibold" htmlFor="upi">
                  UPI / Online Payment
                </label>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold mb-3">Order Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Subtotal</span>
                <span>₹{safeSubtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Shipping</span>
                <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary">Tax (5%)</span>
                <span>₹{estimatedTax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                <span>Total</span>
                <span className="text-success">₹{finalTotal.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-success btn-lg rounded-pill w-100 fw-semibold shadow-sm"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>

              <div className="text-center text-muted small mt-3 d-flex align-items-center justify-content-center gap-1">
                <FaLock className="text-secondary" /> Secure Checkout
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}