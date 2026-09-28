import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaShoppingBag,
  FaLock,
  FaTruck,
  FaTag,
} from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20fill%3D%22%23f8f9fa%22%20width%3D%22200%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%236c757d%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems = [],
    loading,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemsCount = 0,
    totalPrice = 0,
  } = useCart();

  useEffect(() => {
    if (fetchCart) {
      fetchCart();
    }
  }, []);

  const safeTotalPrice = Number(totalPrice) || 0;
  const shippingFee = safeTotalPrice > 50 || cartItems.length === 0 ? 0.0 : 4.99;
  const estimatedTax = safeTotalPrice * 0.05;
  const finalTotal = safeTotalPrice + shippingFee + estimatedTax;

  const formatImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith("http") || url.startsWith("data:image")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE;
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 py-5 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading Cart...</span>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="bg-light min-vh-100 py-5 d-flex align-items-center">
        <div className="container" style={{ maxWidth: "550px" }}>
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
            <div className="mb-3 text-success opacity-75">
              <FaShoppingBag style={{ fontSize: "3.5rem" }} />
            </div>
            <h3 className="fw-bold text-dark mb-2">Your Shopping Cart is Empty</h3>
            <p className="text-secondary mb-4">
              Looks like you haven't added any fresh groceries or essentials to your cart yet.
            </p>
            <div>
              <Link
                to="/products"
                className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
              >
                <FaArrowLeft /> Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      <div className="container" style={{ maxWidth: "1150px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Shopping Cart</h2>
            <p className="text-muted small mb-0">
              You have <span className="fw-bold text-success">{totalItemsCount}</span> item(s) in your cart
            </p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="btn btn-outline-danger btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1"
          >
            <FaTrashAlt /> Clear Cart
          </button>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="bg-light border-bottom">
                      <tr className="text-secondary small text-uppercase">
                        <th style={{ minWidth: "240px" }} className="ps-4 py-3">Product</th>
                        <th className="py-3">Price</th>
                        <th className="py-3 text-center">Quantity</th>
                        <th className="py-3 text-end pe-4">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => {
                        const itemId = item.id ?? item.productId ?? item.product?.id ?? index;
                        const itemPrice = Number(item.price ?? item.product?.price) || 0;
                        const itemQuantity = Number(item.quantity) || 1;
                        const itemSubtotal = itemPrice * itemQuantity;
                        const itemName = item.name ?? item.product?.name ?? "Unnamed Product";
                        const itemImage = item.imageUrl ?? item.product?.imageUrl;
                        const itemBrand = item.brand ?? item.product?.brand;

                        return (
                          <tr key={itemId} className="border-bottom">
                            <td className="ps-4 py-3">
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src={formatImageUrl(itemImage)}
                                  alt={itemName}
                                  className="rounded-3 border object-fit-cover"
                                  style={{ width: "64px", height: "64px" }}
                                  onError={handleImageError}
                                />
                                <div>
                                  <h6 className="fw-bold text-dark mb-1">{itemName}</h6>
                                  {itemBrand && (
                                    <span className="badge bg-light text-secondary border rounded-pill px-2 py-1 small mb-1">
                                      <FaTag className="me-1 text-success" />
                                      {itemBrand}
                                    </span>
                                  )}
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => removeFromCart(itemId)}
                                      className="btn btn-link text-danger text-decoration-none p-0 small fw-semibold d-inline-flex align-items-center gap-1"
                                      style={{ fontSize: "0.825rem" }}
                                    >
                                      <FaTrashAlt style={{ fontSize: "0.75rem" }} /> Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 fw-semibold text-dark">
                              ₹{itemPrice.toFixed(2)}
                            </td>

                            <td className="py-3 text-center">
                              <div
                                className="input-group input-group-sm rounded-pill border overflow-hidden mx-auto"
                                style={{ width: "110px" }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (itemQuantity > 1) {
                                      updateQuantity(itemId, itemQuantity - 1);
                                    } else {
                                      removeFromCart(itemId);
                                    }
                                  }}
                                  className="btn btn-light border-0 fw-bold px-2 text-secondary"
                                >
                                  <FaMinus style={{ fontSize: "0.7rem" }} />
                                </button>
                                <input
                                  type="text"
                                  readOnly
                                  value={itemQuantity}
                                  className="form-control border-0 text-center fw-bold bg-white px-0"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(itemId, itemQuantity + 1)}
                                  className="btn btn-light border-0 fw-bold px-2 text-secondary"
                                >
                                  <FaPlus style={{ fontSize: "0.7rem" }} />
                                </button>
                              </div>
                            </td>

                            <td className="py-3 text-end pe-4 fw-bold text-success fs-6">
                              ₹{itemSubtotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link to="/products" className="text-success text-decoration-none fw-semibold d-inline-flex align-items-center gap-2">
                <FaArrowLeft /> Continue Shopping
              </Link>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: "20px" }}>
              <h5 className="fw-bold text-dark mb-4">Order Summary</h5>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Items Subtotal</span>
                <span className="fw-semibold text-dark">₹{safeTotalPrice.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Estimated Shipping</span>
                <span className="fw-semibold text-dark">
                  {shippingFee === 0 ? (
                    <span className="text-success fw-bold">FREE</span>
                  ) : (
                    `₹${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-secondary">Estimated Tax (5%)</span>
                <span className="fw-semibold text-dark">₹{estimatedTax.toFixed(2)}</span>
              </div>

              {shippingFee > 0 && (
                <div className="alert alert-success border-0 bg-success-subtle text-success small mb-3 rounded-3 py-2 d-flex align-items-center gap-2">
                  <FaTruck className="flex-shrink-0" />
                  <span>
                    Add <strong>₹{(50 - safeTotalPrice).toFixed(2)}</strong> more to get <strong>Free Shipping</strong>!
                  </span>
                </div>
              )}

              <hr className="my-3" />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold text-dark fs-5">Total</span>
                <span className="fw-bold text-success fs-4">₹{finalTotal.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="btn btn-success btn-lg rounded-pill w-100 fw-semibold shadow-sm mb-3"
              >
                Proceed to Checkout
              </button>

              <div className="text-center text-muted small d-flex align-items-center justify-content-center gap-1">
                <FaLock className="text-secondary" /> Safe & Encrypted Checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}