import React from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingBag,
  FaEnvelope,
  FaPhoneAlt,
  FaTruck,
  FaShieldAlt,
  FaHeadset,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-auto border-top border-success">
      <div className="container">
        {/* Value Proposition Badges */}
        <div className="row g-4 pb-4 mb-4 border-bottom border-secondary text-center text-md-start">
          <div className="col-12 col-md-4 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
            <FaTruck className="text-success fs-2 flex-shrink-0" />
            <div>
              <h6 className="fw-bold mb-0">Fast Home Delivery</h6>
              <small className="text-secondary">Fresh groceries at your doorstep</small>
            </div>
          </div>
          <div className="col-12 col-md-4 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
            <FaShieldAlt className="text-success fs-2 flex-shrink-0" />
            <div>
              <h6 className="fw-bold mb-0">Secure Payments</h6>
              <small className="text-secondary">100% safe transaction processing</small>
            </div>
          </div>
          <div className="col-12 col-md-4 d-flex align-items-center justify-content-center justify-content-md-start gap-3">
            <FaHeadset className="text-success fs-2 flex-shrink-0" />
            <div>
              <h6 className="fw-bold mb-0">24/7 Customer Support</h6>
              <small className="text-secondary">We are here to help anytime</small>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info */}
        <div className="row g-4 mb-4">
          {/* Brand Info */}
          <div className="col-12 col-md-5">
            <Link
              to="/products"
              className="text-decoration-none d-inline-flex align-items-center gap-2 mb-3"
            >
              <FaShoppingBag className="text-success fs-3" />
              <span className="fs-4 fw-bold text-white">
                Grocery<span className="text-success">Store</span>
              </span>
            </Link>
            <p className="text-secondary small pe-lg-5">
              Your one-stop destination for farm-fresh fruits, vegetables, dairy,
              and daily household essentials with guaranteed reliability.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3">
            <h6 className="fw-bold text-uppercase mb-3 text-success">Quick Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small mb-0">
              <li>
                <Link to="/products" className="text-secondary text-decoration-none link-light">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-secondary text-decoration-none link-light">
                  My Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-secondary text-decoration-none link-light">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-secondary text-decoration-none link-light">
                  User Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="col-6 col-md-4">
            <h6 className="fw-bold text-uppercase mb-3 text-success">Contact Us</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary mb-0">
              <li className="d-flex align-items-center gap-2">
                <FaEnvelope className="text-success" />
                <span>support@grocerystore.com</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <FaPhoneAlt className="text-success" />
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="mt-2 text-white-50">
                <small>Available 24/7 for order updates & support.</small>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-3" />

        {/* Copyright Notice */}
        <div className="text-center text-secondary small">
          © {new Date().getFullYear()} <strong className="text-white">GroceryStore</strong>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}