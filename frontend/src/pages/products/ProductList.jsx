import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaSync,
  FaPlus,
  FaShoppingBasket
} from "react-icons/fa";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import ProductCard from "./ProductCard";
import { useAuth } from "../../contexts/AuthContext";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  // Admin Check Logic
  const isAdmin =
    user?.role === "ADMIN" ||
    user?.roles?.includes("ADMIN") ||
    localStorage.getItem("role") === "ADMIN";

  // Fetch Products & Categories
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories().catch(() => []), // Fallback gracefully if categories fail
      ]);

      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error("Failed to load store data:", err);
      setError("Failed to fetch products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Dynamic search and category filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Handle numeric IDs vs object references for category check
      const matchesCategory =
        selectedCategory === "ALL" ||
        product.categoryId === Number(selectedCategory) ||
        product.category?.id === Number(selectedCategory);

      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="bg-light min-vh-100 py-4 py-md-5">
      <div className="container">
        
        {/* Banner / Header Container */}
        <div className="card border-0 bg-white shadow-sm rounded-4 p-4 mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 mb-2">
                Fresh & Organic
              </span>
              <h1 className="h2 fw-bold text-dark mb-1">Grocery Store</h1>
              <p className="text-muted small mb-0">
                Explore high-quality daily essentials sourced directly for you.
              </p>
            </div>

            {/* Admin Action Buttons */}
            {isAdmin && (
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={fetchData}
                  className="btn btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-2"
                  title="Refresh products"
                >
                  <FaSync /> Refresh
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/products/add")}
                  className="btn btn-success rounded-pill px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
                >
                  <FaPlus /> Add Product
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div className="row g-3 align-items-center">
            
            {/* Search Input */}
            <div className="col-md-6 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-secondary">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search products by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Dropdown Filter */}
            <div className="col-md-4 col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-secondary">
                  <FaFilter />
                </span>
                <select
                  className="form-select bg-light border-start-0"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Filters Button */}
            <div className="col-md-2 col-lg-3 text-md-end">
              <button
                className="btn btn-outline-secondary rounded-pill w-100 w-md-auto px-3"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  fetchData();
                }}
              >
                <FaSync className="me-1" /> Reset
              </button>
            </div>

          </div>
        </div>

        {/* Loading Skeleton View */}
        {loading && (
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((skeleton) => (
              <div key={skeleton} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card border-0 rounded-4 shadow-sm p-3" aria-hidden="true">
                  <div
                    className="bg-secondary-subtle rounded-3 mb-3 placeholder-glow"
                    style={{ height: "180px" }}
                  >
                    <div className="placeholder w-100 h-100 rounded-3"></div>
                  </div>
                  <div className="placeholder-glow">
                    <span className="placeholder col-4 mb-2"></span>
                    <span className="placeholder col-8 mb-3 d-block"></span>
                    <span className="placeholder col-12 mb-2"></span>
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
                      <span className="placeholder col-4 py-2"></span>
                      <span className="placeholder col-5 py-3 rounded-3"></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Alert View */}
        {!loading && error && (
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center my-4">
            <div className="text-danger mb-2 fs-1">⚠️</div>
            <h5 className="fw-bold text-dark mb-2">Unable to load catalog</h5>
            <p className="text-muted small mb-3">{error}</p>
            <div>
              <button
                type="button"
                onClick={fetchData}
                className="btn btn-outline-danger rounded-pill px-4 btn-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State View */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-4">
            <div className="text-muted mb-3 fs-1">
              <FaShoppingBasket />
            </div>
            <h4 className="fw-bold text-dark mb-2">No Products Found</h4>
            <p className="text-muted small mb-4">
              {products.length === 0
                ? "Your inventory is currently empty."
                : "No items matched your search or category filter criteria."}
            </p>
            {isAdmin && products.length === 0 ? (
              <div>
                <button
                  type="button"
                  onClick={() => navigate("/products/add")}
                  className="btn btn-success rounded-pill px-4 py-2 fw-semibold"
                >
                  + Add Your First Product
                </button>
              </div>
            ) : (
              <div>
                <button
                  className="btn btn-success rounded-pill px-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Responsive Product Cards Grid (Reusing ProductCard Component) */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="row g-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductList;