import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/home" className="brand-logo">
          🛒 Fresh<span className="brand-accent">Grocery</span>
        </Link>

        <div className="nav-search">
          <input
            type="text"
            placeholder="Search fresh products..."
            className="search-input"
          />
          <button className="search-btn" aria-label="Search">🔍</button>
        </div>

        <nav className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <Link to="/home" className="nav-item">Home</Link>
          <Link to="/products" className="nav-item">Products</Link>

          {user ? (
            <>
              <Link to="/cart" className="nav-item cart-link">
                🛒 Cart
              </Link>
              <Link to="/orders" className="nav-item">My Orders</Link>
              <Link to="/profile" className="nav-item profile-link">
                👤 {user.email}
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item btn-login-link">Login</Link>
              <Link to="/register" className="nav-item btn-register-link">Register</Link>
            </>
          )}
        </nav>

        <button 
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;