import React, { useEffect, useState, useMemo, useCallback } from "react";
import { 
  FaBoxes, 
  FaSearch, 
  FaExclamationTriangle, 
  FaSync, 
  FaPlusCircle, 
  FaMinusCircle, 
  FaUndo 
} from "react-icons/fa";
import API from "../../services/api";
import productService from "../../services/productService";

const LOW_STOCK_THRESHOLD = 5;

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [stockInputs, setStockInputs] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  // Fetch product list and their respective inventory records
  const fetchInventoryData = useCallback(async (isMounted = true) => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch products
      let productList = [];
      if (typeof productService?.getAllProducts === "function") {
        productList = await productService.getAllProducts();
      } else {
        const res = await API.get("/api/products");
        productList = Array.isArray(res.data) ? res.data : res.data?.content || [];
      }

      // 2. Fetch inventory details for each product from /api/inventory/{productId}
      const invMap = {};
      await Promise.allSettled(
        productList.map(async (product) => {
          const pId = product.id || product.productId;
          if (!pId) return;

          try {
            const invRes = await API.get(`/api/inventory/${pId}`);
            invMap[pId] = invRes.data; // Expecting InventoryResponse { quantity, ... }
          } catch (err) {
            console.warn(`Could not fetch inventory for Product #${pId}:`, err);
            invMap[pId] = { quantity: product.stockQuantity ?? 0 };
          }
        })
      );

      if (isMounted) {
        setProducts(productList);
        setInventoryMap(invMap);
        setStockInputs({});
      }
    } catch (err) {
      console.error("Failed to load inventory data:", err);
      if (isMounted) setError("Failed to fetch inventory records.");
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchInventoryData(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchInventoryData]);

  const handleInputChange = (productId, value) => {
    const val = parseInt(value, 10);
    setStockInputs((prev) => ({
      ...prev,
      [productId]: isNaN(val) ? "" : Math.max(1, val)
    }));
  };

  // Helper to execute API PUT requests against /api/inventory endpoints
  const handleStockOperation = async (productId, endpoint, quantity) => {
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity greater than 0.");
      return;
    }

    setActionLoadingId(`${productId}-${endpoint}`);
    try {
      const res = await API.put(`/api/inventory/${endpoint}/${productId}`, {
        quantity: Number(quantity)
      });

      // Update local inventory map
      setInventoryMap((prev) => {
        const updatedQty = typeof res.data === "object" && res.data?.quantity !== undefined
          ? res.data.quantity
          : endpoint === "add-stock" || endpoint === "restore-stock"
          ? (prev[productId]?.quantity || 0) + Number(quantity)
          : Math.max(0, (prev[productId]?.quantity || 0) - Number(quantity));

        return {
          ...prev,
          [productId]: { ...prev[productId], quantity: updatedQty }
        };
      });

      // Clear the input field for this product
      setStockInputs((prev) => ({ ...prev, [productId]: "" }));
    } catch (err) {
      console.error(`Failed to execute ${endpoint} for product #${productId}:`, err);
      const msg = err.response?.data?.message || err.response?.data || "Operation failed.";
      alert(`Error: ${msg}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const pId = p.id || p.productId;
      const name = p.name || p.productName || "";
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(pId).includes(searchTerm);

      const currentQty = inventoryMap[pId]?.quantity ?? 0;
      const matchesLowStock = !showLowStockOnly || currentQty <= LOW_STOCK_THRESHOLD;

      return matchesSearch && matchesLowStock;
    });
  }, [products, inventoryMap, searchTerm, showLowStockOnly]);

  const lowStockCount = useMemo(() => {
    return Object.values(inventoryMap).filter(
      (inv) => (inv?.quantity ?? 0) <= LOW_STOCK_THRESHOLD
    ).length;
  }, [inventoryMap]);

  if (loading) {
    return (
      <div className="bg-light min-vh-100 py-5 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading Inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "1100px" }}>
        
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1">Inventory Management</h2>
            <p className="text-secondary mb-0">Manage stock levels</p>
          </div>
          <button className="btn btn-outline-secondary rounded-pill px-3" onClick={() => fetchInventoryData()}>
            <FaSync className="me-2" /> Refresh
          </button>
        </div>

        {/* Overview Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <span className="text-secondary small fw-semibold">Total Products Monitored</span>
              <h3 className="fw-bold text-dark mb-0">{products.length}</h3>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <span className="text-secondary small fw-semibold">Low Stock Threshold (&le; {LOW_STOCK_THRESHOLD})</span>
              <h3 className={`fw-bold mb-0 ${lowStockCount > 0 ? "text-danger" : "text-success"}`}>
                {lowStockCount} Items
              </h3>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-light shadow-none"
                  placeholder="Search by product name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-md-end gap-2">
              <button
                className={`btn rounded-pill px-3 ${
                  showLowStockOnly ? "btn-danger" : "btn-outline-danger"
                }`}
                onClick={() => setShowLowStockOnly((prev) => !prev)}
              >
                <FaExclamationTriangle className="me-2" />
                Low Stock ({lowStockCount})
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light text-secondary small">
                <tr>
                  <th className="ps-4">Product</th>
                  <th>Price</th>
                  <th className="text-center">Current Stock</th>
                  <th className="text-center" style={{ minWidth: "130px" }}>Qty Target</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const pId = product.id || product.productId;
                  const currentQty = inventoryMap[pId]?.quantity ?? 0;
                  const inputQty = stockInputs[pId] ?? "";

                  return (
                    <tr key={pId}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <FaBoxes className="text-success" />
                          <div>
                            <span className="fw-semibold text-dark d-block">
                              {product.name || product.productName}
                            </span>
                            <span className="text-muted small">Product ID: #{pId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="fw-semibold">₹{Number(product.price || 0).toFixed(2)}</td>
                      <td className="text-center">
                        {currentQty <= LOW_STOCK_THRESHOLD ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger rounded-pill px-3 py-2 fs-6 fw-bold">
                            {currentQty}
                          </span>
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success rounded-pill px-3 py-2 fs-6 fw-bold">
                            {currentQty}
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          className="form-control form-control-sm text-center fw-bold rounded-pill mx-auto"
                          style={{ maxWidth: "100px" }}
                          value={inputQty}
                          onChange={(e) => handleInputChange(pId, e.target.value)}
                        />
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-inline-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-success rounded-pill px-2"
                            title="Add Stock"
                            disabled={!inputQty || actionLoadingId === `${pId}-add-stock`}
                            onClick={() => handleStockOperation(pId, "add-stock", inputQty)}
                          >
                            <FaPlusCircle className="me-1" /> Add
                          </button>
                          
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-2"
                            title="Remove Stock"
                            disabled={!inputQty || actionLoadingId === `${pId}-remove-stock`}
                            onClick={() => handleStockOperation(pId, "remove-stock", inputQty)}
                          >
                            <FaMinusCircle className="me-1" /> Remove
                          </button>

                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-2"
                            title="Restore Stock"
                            disabled={!inputQty || actionLoadingId === `${pId}-restore-stock`}
                            onClick={() => handleStockOperation(pId, "restore-stock", inputQty)}
                          >
                            <FaUndo className="me-1" /> Restore
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}