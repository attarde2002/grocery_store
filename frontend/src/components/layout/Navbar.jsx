import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaPlusCircle,
  FaShoppingBag,
  FaBoxes,
  FaWarehouse,
  FaTags
} from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { totalItemsCount } = useCart();

  // Retrieve auth state from localStorage
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  const isAuthenticated = !!token;
  const isAdmin = userRole === "ADMIN";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top py-2">
      <div className="container">
        
        {/* Brand Logo */}
        <Link to="/products" className="navbar-brand fw-bold fs-4 text-success d-flex align-items-center gap-2">
          <FaShoppingBag className="text-success" />
          <span>Grocery<span className="text-dark">Store</span></span>
        </Link>

        {/* Mobile Navbar Toggler Button */}
        <button
          className="navbar-toggler border-0 shadow-none p-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarGroceryContent"
          aria-controls="navbarGroceryContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links & Actions Collapsible Body */}
        <div className="collapse navbar-collapse" id="navbarGroceryContent">
          
          {/* Main Nav Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-semibold align-items-lg-center">
            <li className="nav-item">
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? "text-success active fw-bold" : "text-secondary"}`
                }
              >
                <FaBoxes className="me-1 mb-1" /> Products
              </NavLink>
            </li>

            {isAuthenticated && (
              <li className="nav-item">
                <NavLink
                  to="/my-orders"
                  className={({ isActive }) =>
                    `nav-link px-3 ${isActive ? "text-success active fw-bold" : "text-secondary"}`
                  }
                >
                  My Orders
                </NavLink>
              </li>
            )}

            {/* Admin Links */}
            {isAuthenticated && isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/categories"
                    className={({ isActive }) =>
                      `nav-link px-3 ${isActive ? "text-success active fw-bold" : "text-secondary"}`
                    }
                  >
                    <FaTags className="me-1 mb-1" /> Categories
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/inventory"
                    className={({ isActive }) =>
                      `nav-link px-3 ${isActive ? "text-success active fw-bold" : "text-secondary"}`
                    }
                  >
                    <FaWarehouse className="me-1 mb-1" /> Inventory
                  </NavLink>
                </li>
                <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                  <NavLink
                    to="/products/add"
                    className="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1"
                  >
                    <FaPlusCircle /> Add Product
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* Right Action Icons & Controls */}
          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 mt-3 mt-lg-0 pt-2 pt-lg-0 border-top border-lg-0">
            
            {/* Cart Link with Badge */}
            <Link
              to="/cart"
              className="btn btn-light position-relative rounded-pill px-3 py-2 border-0 shadow-sm d-flex align-items-center gap-2 text-dark fw-semibold"
            >
              <div className="position-relative">
                <FaShoppingCart className="fs-5 text-success" />
                {totalItemsCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>

            {/* User Auth Section */}
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary rounded-pill px-3 py-2 dropdown-toggle d-flex align-items-center gap-2 w-100 justify-content-between"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: "160px" }}>
                    <FaUser className="text-success" />
                    <small className="fw-semibold">{email?.split("@")[0] || "Profile"}</small>
                  </span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 mt-2 p-2" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-menu-item dropdown-item rounded-3 py-2 d-flex align-items-center gap-2 fw-semibold" to="/profile">
                      <FaUser className="text-secondary" /> Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="dropdown-item text-danger rounded-3 py-2 d-flex align-items-center gap-2 fw-semibold"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
              >
                <FaUser />
                <span>Login</span>
              </Link>
            )}

          </div>

        </div>

      </div>
    </nav>
  );
}