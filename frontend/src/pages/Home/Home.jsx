import React from "react";
import { useNavigate } from "react-router-dom";
import authService, { getCurrentUser } from "../../services/authService";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-brand">Grocery Store</div>
        <div className="home-nav">
          <span className="user-badge">
            {user?.email || "User"} ({user?.role || "USER"})
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="home-content">
        <div className="welcome-card">
          <h2>Welcome back!</h2>
          <p>User ID: {user?.userId || "N/A"}</p>
        </div>

        <div className="grid-cards">
          <div className="home-card" onClick={() => navigate("/products")}>
            <h3>Products</h3>
            <p>Browse groceries and store inventory.</p>
          </div>

          <div className="home-card" onClick={() => navigate("/cart")}>
            <h3>Cart</h3>
            <p>View your shopping bag and proceed to checkout.</p>
          </div>

          <div className="home-card" onClick={() => navigate("/orders")}>
            <h3>My Orders</h3>
            <p>Track order statuses and history.</p>
          </div>

          <div className="home-card" onClick={() => navigate("/profile")}>
            <h3>Profile</h3>
            <p>View account profile details.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;