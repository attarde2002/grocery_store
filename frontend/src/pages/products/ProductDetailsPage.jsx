import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import productService from "../../services/productService";
import inventoryService from "../../services/inventoryService";
import { useCart } from "../../contexts/CartContext"; // Import Cart Context

// Fallback SVG data URI for missing or broken images
const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22450%22%20viewBox%3D%220%200%20600%20450%22%3E%3Crect%20fill%3D%22%23f8f9fa%22%20width%3D%22600%22%20height%3D%22450%22%2F%3E%3Ctext%20fill%3D%22%236c757d%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Access context action

  const [product, setProduct] = useState(null);
  const [stockCount, setStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCartAlert, setAddedToCartAlert] = useState(false);

  useEffect(() => {
    fetchProductAndInventoryData();
  }, [id]);

  const fetchProductAndInventoryData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Fetch product details
      const productData = await productService.getProductById(id);
      setProduct(productData);

      // 2. Fetch inventory stock for this product
      try {
        const inventoryData = await inventoryService.getInventoryByProductId(id);
        const availableStock = inventoryData?.quantity ?? inventoryData?.stock ?? 0;
        setStockCount(availableStock);
      } catch (invErr) {
        console.warn("Could not fetch inventory stock, defaulting to 0:", invErr);
        setStockCount(0);
      }

    } catch (err) {
      console.error("Error fetching product details:", err);
      setError("Product not found or failed to load. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith("http") || url.startsWith("data:image")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE;
  };

  const isOutOfStock = stockCount === 0;

  const handleQuantityChange = (type) => {
    if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    } else if (type === "increment" && quantity < stockCount) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      setSubmitting(true);
      setError("");

      if (!product) return;

      // Update CartContext directly
      addToCart(product, quantity);

      setAddedToCartAlert(true);
      setTimeout(() => setAddedToCartAlert(false), 3000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setError("Failed to add item to cart. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 py-5">
        <div className="container" style={{ maxWidth: "1000px" }}>
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 placeholder-glow">
            <div className="row g-4">
              <div className="col-md-6">
                <div
                  className="bg-secondary-subtle rounded-4 placeholder"
                  style={{ height: "350px", width: "100%" }}
                ></div>
              </div>
              <div className="col-md-6">
                <span className="placeholder col-4 mb-3 d-block"></span>
                <span className="placeholder col-8 py-3 mb-3 d-block"></span>
                <span className="placeholder col-10 mb-2 d-block"></span>
                <span className="placeholder col-6 mb-4 d-block"></span>
                <span className="placeholder col-5 py-4 mb-4 d-block"></span>
                <span className="placeholder col-12 py-3 rounded-pill d-block"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="bg-light min-vh-100 py-5">
        <div className="container" style={{ maxWidth: "600px" }}>
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
            <div className="text-danger mb-3 fs-1">⚠️</div>
            <h4 className="fw-bold text-dark mb-2">Product Not Found</h4>
            <p className="text-muted small mb-4">{error || "The requested item does not exist."}</p>
            <div>
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="btn btn-success rounded-pill px-4 fw-semibold"
              >
                Back to Grocery List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      <div className="container" style={{ maxWidth: "1100px" }}>
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/products" className="text-decoration-none text-muted">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products" className="text-decoration-none text-muted">
                {product?.categoryName || "Groceries"}
              </Link>
            </li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
              {product?.name}
            </li>
          </ol>
        </nav>

        {/* Action / Error Alerts */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show rounded-4 shadow-sm mb-4" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
              aria-label="Close"
            ></button>
          </div>
        )}

        {addedToCartAlert && (
          <div className="alert alert-success alert-dismissible fade show rounded-4 shadow-sm mb-4" role="alert">
            <strong>Success!</strong> Added {quantity} item(s) of <strong>{product?.name}</strong> to your cart.
            <button
              type="button"
              className="btn-close"
              onClick={() => setAddedToCartAlert(false)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Main Product Details Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-body p-4 p-md-5">
            <div className="row g-4 lg-g-5 align-items-center">
              
              {/* Product Image Column */}
              <div className="col-12 col-md-6">
                <div
                  className="position-relative bg-light rounded-4 overflow-hidden border border-light"
                  style={{ height: "380px" }}
                >
                  <span className="position-absolute top-0 start-0 m-3 badge bg-white text-success border border-success-subtle rounded-pill px-3 py-2 shadow-sm z-1">
                    {product?.brand || product?.categoryName || "Grocery"}
                  </span>

                  <img
                    src={formatImageUrl(product?.imageUrl)}
                    alt={product?.name || "Product"}
                    className="w-100 h-100 object-fit-cover"
                    onError={handleImageError}
                  />
                </div>
              </div>

              {/* Product Info & Controls Column */}
              <div className="col-12 col-md-6 d-flex flex-column justify-content-between">
                <div>
                  <span className="text-uppercase text-success fw-bold small tracking-wider">
                    {product?.categoryName || "Fresh Grocery"}
                  </span>

                  <h1 className="h2 fw-bold text-dark mt-1 mb-2">{product?.name}</h1>

                  {/* Stock Indicator */}
                  <div className="mb-3">
                    {isOutOfStock ? (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1.5">
                        Out of Stock
                      </span>
                    ) : stockCount < 5 ? (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-1.5">
                        Low Stock: Only {stockCount} left!
                      </span>
                    ) : (
                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1.5">
                        In Stock ({stockCount} available)
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="fs-1 fw-extrabold text-dark me-2">
                      ₹ {parseFloat(product?.price || 0).toFixed(2)}
                    </span>
                    <span className="text-muted small">/ item</span>
                  </div>

                  {/* Description */}
                  <p className="text-secondary leading-relaxed mb-4">
                    {product?.description ||
                      "Carefully selected, fresh grocery product delivered straight to your home. Guaranteed quality and satisfaction."}
                  </p>
                </div>

                {/* Purchase Controls */}
                <div className="pt-3 border-top">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <label className="fw-semibold text-dark small mb-0">Quantity:</label>
                    <div className="input-group input-group-sm rounded-pill border overflow-hidden" style={{ width: "130px" }}>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange("decrement")}
                        disabled={quantity <= 1 || isOutOfStock || submitting}
                        className="btn btn-light border-0 fw-bold px-3"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={quantity}
                        className="form-control border-0 text-center fw-bold bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange("increment")}
                        disabled={quantity >= stockCount || isOutOfStock || submitting}
                        className="btn btn-light border-0 fw-bold px-3"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="d-grid gap-2 d-sm-flex">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || submitting}
                      className="btn btn-success btn-lg rounded-pill px-4 fw-semibold shadow-sm flex-grow-1"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adding...
                        </>
                      ) : (
                        `Add to Cart • ₹${(parseFloat(product?.price || 0) * quantity).toFixed(2)}`
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/products")}
                      className="btn btn-outline-secondary btn-lg rounded-pill px-4"
                    >
                      Back
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="row g-4 mt-2">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100 bg-white">
              <div className="fs-3 mb-2 text-success">🚚</div>
              <h6 className="fw-bold text-dark">Fast Express Delivery</h6>
              <p className="text-muted small mb-0">Same-day delivery available for fresh daily orders.</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100 bg-white">
              <div className="fs-3 mb-2 text-success">🛡️</div>
              <h6 className="fw-bold text-dark">Quality Guarantee</h6>
              <p className="text-muted small mb-0">100% organic and fresh source verification standard.</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100 bg-white">
              <div className="fs-3 mb-2 text-success">💳</div>
              <h6 className="fw-bold text-dark">Secure Checkout</h6>
              <p className="text-muted small mb-0">Encrypted payment integrations and flexible payment methods.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}