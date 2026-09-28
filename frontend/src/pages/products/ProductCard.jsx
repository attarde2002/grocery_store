import React from "react";
import { Link } from "react-router-dom";

// Self-contained SVG fallback data URI (guaranteed to render offline without network requests)
const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23f8f9fa%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%236c757d%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E";

const ProductCard = ({ product }) => {
  const formatImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    if (url.startsWith("http") || url.startsWith("data:image")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE;
  };

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden w-100">
      {/* 
        FIXED HEIGHT CONTAINER (e.g., 220px) 
        Forces every card's image frame to be identical in height
      */}
      <div 
        className="position-relative bg-light w-100 overflow-hidden" 
        style={{ height: "220px" }}
      >
        {/* Category / Brand Badge */}
        <span className="position-absolute top-0 start-0 m-3 badge bg-white text-success border border-success-subtle rounded-pill px-3 py-2 shadow-sm uppercase z-1">
          {product?.categoryName || product?.brand || "Grocery"}
        </span>

        {/* 
          OBJECT-FIT: COVER
          Ensures image fills the exact 220px box without squishing or stretching 
        */}
        <img
          src={formatImageUrl(product?.imageUrl)}
          alt={product?.name || "Product"}
          className="w-100 h-100 object-fit-cover"
          onError={handleImageError}
        />
      </div>

      {/* Card Body */}
      <div className="card-body p-4 d-flex flex-column justify-between">
        <div>
          <h5 className="card-title fw-bold text-dark mb-2 text-truncate">
            {product?.name || "Untitled Product"}
          </h5>

          <p
            className="card-text text-muted small mb-0"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product?.description ||
              "Fresh, high-quality item carefully sourced for your daily grocery needs."}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3 border-top d-flex align-items-center justify-between">
          <div>
            <span
              className="text-uppercase text-muted d-block fw-semibold"
              style={{ fontSize: "0.7rem" }}
            >
              Price
            </span>
            <span className="fs-4 fw-extrabold text-dark">
              ₹ {parseFloat(product?.price || 0).toFixed(2)}
            </span>
          </div>

          <Link
            to={`/products/${product?.id}`}
            className="btn btn-success rounded-pill px-3 py-2 fw-semibold btn-sm shadow-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;