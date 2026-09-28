import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  FaShoppingBag, 
  FaArrowLeft, 
  FaClock, 
  FaBox, 
  FaCreditCard, 
  FaMobileAlt, 
  FaUniversity, 
  FaMoneyBillWave,
  FaFilter,
  FaUser
} from "react-icons/fa";
import API from "../../services/api"; 
import productService from "../../services/productService"; 
import paymentService from "../../services/paymentService";
import { useAuth } from "../../contexts/AuthContext";

const ORDER_STATUSES = ["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const ALL_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];

export default function MyOrdersPage() {
  const { user } = useAuth();

  const isAdmin = useMemo(() => {
    if (!user) {
      const storedRole = localStorage.getItem("role") || localStorage.getItem("userRole");
      return storedRole === "ADMIN" || storedRole === "ROLE_ADMIN";
    }

    if (typeof user.role === "string") {
      const uRole = user.role.toUpperCase();
      if (uRole === "ADMIN" || uRole === "ROLE_ADMIN") return true;
    }

    if (Array.isArray(user.roles)) {
      return user.roles.some((r) => {
        const roleStr = typeof r === "string" ? r : r?.authority || r?.name || "";
        return roleStr.toUpperCase().includes("ADMIN");
      });
    }

    if (Array.isArray(user.authorities)) {
      return user.authorities.some((a) => {
        const authStr = typeof a === "string" ? a : a?.authority || "";
        return authStr.toUpperCase().includes("ADMIN");
      });
    }

    return false;
  }, [user]);

  const userId = user?.userId || user?.id || localStorage.getItem("userId");

  const [orders, setOrders] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [paymentMap, setPaymentMap] = useState({});
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrdersAndDetails = useCallback(async (isMounted) => {
    setLoading(true);
    setError("");
    try {
      const endpoint = isAdmin ? "/api/orders" : `/api/orders/user/${userId}`;
      
      if (!isAdmin && !userId) {
        if (isMounted) {
          setError("User identification not found. Please log in again.");
          setLoading(false);
        }
        return;
      }

      const ordersRes = await API.get(endpoint);
      let fetchedOrders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.content || [];

      fetchedOrders.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return (b.orderId || b.id || 0) - (a.orderId || a.id || 0);
      });

      // Extract unique missing product IDs
      const productIds = new Set();
      fetchedOrders.forEach((order) => {
        order.items?.forEach((item) => {
          const pId = item.productId ?? item.id ?? item.product?.id;
          const hasInlineName = item.productName || item.name || item.product?.name;
          if (pId !== undefined && pId !== null && !hasInlineName) {
            productIds.add(pId);
          }
        });
      });

      const pMap = {};
      if (productIds.size > 0) {
        await Promise.allSettled(
          Array.from(productIds).map(async (id) => {
            try {
              const productData = await productService.getProductById(id);
              const productName = productData?.name || productData?.productName || productData?.title;
              if (productName) {
                pMap[id] = productName;
                pMap[String(id)] = productName;
              }
            } catch (err) {
              console.warn(`Could not fetch details for product #${id}:`, err);
            }
          })
        );
      }

      // Fetch payment details directly by orderId against the payment table/API
      const payMap = {};
      await Promise.allSettled(
        fetchedOrders.map(async (order) => {
          const currentOrderId = order.orderId || order.id;
          if (!currentOrderId) return;

          try {
            let paymentData = null;
            if (typeof paymentService?.getPaymentByOrderId === "function") {
              paymentData = await paymentService.getPaymentByOrderId(currentOrderId);
            } else {
              const res = await API.get(`/api/payments/order/${currentOrderId}`, {
                validateStatus: (status) => status < 500
              });
              if (res.status === 200) {
                paymentData = res.data;
              }
            }
            
            payMap[currentOrderId] = paymentData || { paymentStatus: "PENDING" };
          } catch (err) {
            payMap[currentOrderId] = { paymentStatus: "PENDING" };
          }
        })
      );

      if (isMounted) {
        setOrders(fetchedOrders);
        setProductMap(pMap);
        setPaymentMap(payMap);
      }
    } catch (err) {
      console.error("Failed to fetch order history:", err);
      if (isMounted) {
        setError("Failed to load order history. Please check server connection.");
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [isAdmin, userId]);

  useEffect(() => {
    let isMounted = true;
    fetchOrdersAndDetails(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchOrdersAndDetails]);

  const filteredOrders = useMemo(() => {
    if (selectedStatusFilter === "ALL") return orders;
    return orders.filter((o) => (o.orderStatus || "PENDING").toUpperCase() === selectedStatusFilter);
  }, [orders, selectedStatusFilter]);

  const isOptionDisabled = (currentStatus, targetStatus) => {
    const curr = (currentStatus || "PENDING").toUpperCase();
    if (curr === targetStatus) return false;
    if (curr === "PENDING") return targetStatus !== "CONFIRMED" && targetStatus !== "CANCELLED";
    if (curr === "CONFIRMED") return targetStatus !== "SHIPPED" && targetStatus !== "CANCELLED";
    if (curr === "SHIPPED") return targetStatus !== "DELIVERED";
    return true;
  };

  const handleStatusUpdate = async (orderId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;

    if (currentStatus === "CANCELLED" || currentStatus === "DELIVERED") {
      alert(`Cannot change status of a ${currentStatus} order.`);
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      await API.put(`/api/orders/${orderId}/status`, null, {
        params: { status: newStatus }
      });

      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          const currentId = o.orderId || o.id;
          return currentId === orderId ? { ...o, orderStatus: newStatus } : o;
        })
      );
    } catch (err) {
      console.error(`Failed to update status for order #${orderId}:`, err);
      const backendMessage = typeof err.response?.data === 'string' 
        ? err.response.data 
        : err.response?.data?.message || err.message;
      alert(`Failed to update order status: ${backendMessage}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

 const handlePaymentStatusUpdate = async (orderId, currentPaymentStatus, newPaymentStatus) => {
    if (currentPaymentStatus === newPaymentStatus) return;

    setUpdatingPaymentId(orderId);
    try {
      // Direct call using Order ID as confirmed by your Postman test
      await API.put(`/api/payments/${orderId}/status`, null, {
        params: { status: newPaymentStatus }
      });

      // Update local state UI instantly
      setPaymentMap((prev) => ({
        ...prev,
        [orderId]: {
          ...prev[orderId],
          paymentStatus: newPaymentStatus
        }
      }));
    } catch (err) {
      console.error(`Failed to update payment status for Order #${orderId}:`, err);
      const backendMessage = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || err.message;
      alert(`Failed to update payment status: ${backendMessage}`);
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return <span className="badge rounded-pill bg-success px-3 py-2 fw-semibold">DELIVERED</span>;
      case "CANCELLED":
        return <span className="badge rounded-pill bg-danger px-3 py-2 fw-semibold">CANCELLED</span>;
      case "CONFIRMED":
        return <span className="badge rounded-pill bg-primary px-3 py-2 fw-semibold">CONFIRMED</span>;
      case "SHIPPED":
        return <span className="badge rounded-pill bg-info text-dark px-3 py-2 fw-semibold">SHIPPED</span>;
      case "PENDING":
      default:
        return <span className="badge rounded-pill bg-warning text-dark px-3 py-2 fw-semibold">PENDING</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return <span className="badge bg-success-subtle text-success border border-success px-3 py-1 rounded-pill">Success</span>;
      case "FAILED":
        return <span className="badge bg-danger-subtle text-danger border border-danger px-3 py-1 rounded-pill">Failed</span>;
      case "REFUNDED":
        return <span className="badge bg-info-subtle text-info border border-info px-3 py-1 rounded-pill">Refunded</span>;
      case "PENDING":
      default:
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning px-3 py-1 rounded-pill">Pending</span>;
    }
  };

  const getPaymentMethodBadge = (method) => {
    if (!method) return null;
    const normalizedMethod = String(method).toUpperCase().trim();

    let IconComponent = FaCreditCard;
    let label = normalizedMethod;
    let badgeStyle = "bg-light text-dark border";

    if (normalizedMethod.includes("UPI")) {
      IconComponent = FaMobileAlt;
      label = "UPI";
      badgeStyle = "bg-info-subtle text-info-emphasis border border-info";
    } else if (normalizedMethod.includes("CARD") || normalizedMethod.includes("CREDIT") || normalizedMethod.includes("DEBIT")) {
      IconComponent = FaCreditCard;
      label = "CARD";
      badgeStyle = "bg-primary-subtle text-primary border border-primary";
    } else if (normalizedMethod.includes("BANK") || normalizedMethod.includes("NET")) {
      IconComponent = FaUniversity;
      label = "NET BANKING";
      badgeStyle = "bg-secondary-subtle text-secondary-emphasis border border-secondary";
    } else if (normalizedMethod.includes("COD") || normalizedMethod.includes("CASH")) {
      IconComponent = FaMoneyBillWave;
      label = "COD";
      badgeStyle = "bg-success-subtle text-success-emphasis border border-success";
    }

    return (
      <span className={`badge ${badgeStyle} px-2 py-1 rounded d-inline-flex align-items-center gap-1 ms-1 text-uppercase fw-semibold`}>
        <IconComponent style={{ fontSize: "0.85rem" }} />
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 py-5 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading Orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block px-4 py-3 rounded-4 shadow-sm">{error}</div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-light min-vh-100 py-5 d-flex align-items-center">
        <div className="container text-center" style={{ maxWidth: "500px" }}>
          <div className="card border-0 shadow-sm rounded-4 p-5 bg-white">
            <FaShoppingBag className="text-success mb-3 mx-auto" style={{ fontSize: "3rem" }} />
            <h4 className="fw-bold mb-2">No Orders Found</h4>
            <p className="text-secondary mb-4">
              {isAdmin ? "There are no customer orders in the system yet." : "You haven't placed any orders yet."}
            </p>
            {!isAdmin && (
              <Link to="/products" className="btn btn-success rounded-pill px-4 fw-semibold">
                <FaArrowLeft className="me-2" /> Start Shopping
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "950px" }}>
        
        {/* Header Section */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1">{isAdmin ? "Admin Order Management" : "My Orders"}</h2>
            <p className="text-secondary mb-0">Total Orders: {orders.length}</p>
          </div>

          {/* Admin Filter Controls */}
          {isAdmin && (
            <div className="d-flex align-items-center gap-2">
              <FaFilter className="text-secondary" />
              <span className="fw-semibold text-secondary small">Filter Status:</span>
              <select
                className="form-select rounded-pill px-3 shadow-sm border-0 fw-semibold text-dark"
                style={{ width: "160px" }}
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Orders List */}
        {!filteredOrders.length ? (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
            <FaShoppingBag className="text-muted mb-3 mx-auto" style={{ fontSize: "3rem" }} />
            <h5 className="fw-bold text-secondary">No Matching Orders</h5>
            <p className="text-muted mb-0">No orders match the filter "{selectedStatusFilter}".</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {filteredOrders.map((order) => {
              const currentOrderId = order.orderId || order.id;
              const currentStatus = (order.orderStatus || "PENDING").toUpperCase();
              const isTerminal = currentStatus === "CANCELLED" || currentStatus === "DELIVERED";
              
              // Read explicitly from paymentMap using currentOrderId
              const paymentInfo = paymentMap[currentOrderId];
              const currentPaymentStatus = String(
                paymentInfo?.paymentStatus || paymentInfo?.status || "PENDING"
              ).toUpperCase();
              const paymentMethod = paymentInfo?.paymentMethod || paymentInfo?.method;
              const transactionId = paymentInfo?.transactionId || paymentInfo?.txnId;

              const isPaymentTerminal = currentPaymentStatus === "SUCCESS" || currentPaymentStatus === "FAILED" || currentPaymentStatus === "REFUNDED";

              return (
                <div key={currentOrderId} className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                  
                  {/* Card Header */}
                  <div className="card-header bg-white border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-bold text-dark fs-5">Order #{currentOrderId}</span>
                      {isAdmin && (
                        <span className="text-muted small">
                          <FaUser className="me-1 text-secondary" /> User ID: {order.userId || order.user?.id || "N/A"}
                        </span>
                      )}
                      <span className="text-muted small">
                        <FaClock className="me-1" />
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recent"}
                      </span>
                    </div>

                    {/* ORDER STATUS RENDER */}
                    <div className="d-flex align-items-center gap-2">
                      {isAdmin ? (
                        <>
                          <span className="text-muted small fw-semibold">Status:</span>
                          <select
                            className={`form-select form-select-sm rounded-pill px-3 fw-bold ${
                              currentStatus === "DELIVERED"
                                ? "bg-success text-white"
                                : currentStatus === "CANCELLED"
                                ? "bg-danger text-white"
                                : currentStatus === "CONFIRMED"
                                ? "bg-primary text-white"
                                : currentStatus === "SHIPPED"
                                ? "bg-info text-dark"
                                : "bg-warning text-dark"
                            }`}
                            style={{ minWidth: "140px", cursor: isTerminal ? "not-allowed" : "pointer" }}
                            value={currentStatus}
                            disabled={updatingOrderId === currentOrderId || isTerminal}
                            onChange={(e) => handleStatusUpdate(currentOrderId, currentStatus, e.target.value)}
                          >
                            {ALL_STATUSES.map((statusOption) => (
                              <option 
                                key={statusOption} 
                                value={statusOption}
                                className="bg-white text-dark"
                                disabled={isOptionDisabled(currentStatus, statusOption)}
                              >
                                {statusOption}
                              </option>
                            ))}
                          </select>
                        </>
                      ) : (
                        getOrderStatusBadge(currentStatus)
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body p-4">
                    <div className="table-responsive">
                      <table className="table align-middle mb-0">
                        <thead>
                          <tr className="text-secondary small">
                            <th>Product Name</th>
                            <th className="text-center">Quantity</th>
                            <th className="text-end">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items?.map((item, index) => {
                            const targetProductId = item.productId ?? item.id ?? item.product?.id;
                            const displayName =
                              item.productName ||
                              item.name ||
                              item.product?.name ||
                              productMap[targetProductId] ||
                              productMap[String(targetProductId)] ||
                              `Product #${targetProductId || index + 1}`;

                            return (
                              <tr key={item.id ?? `${currentOrderId}-${index}`}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <FaBox className="text-success" />
                                    <span className="fw-semibold text-dark">{displayName}</span>
                                  </div>
                                </td>
                                <td className="text-center">{item.quantity || 1}</td>
                                <td className="text-end fw-semibold">₹{Number(item.price || 0).toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <hr className="my-3" />

                    {/* Card Footer */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="text-muted small">Payment:</span>
                        
                        {/* PAYMENT STATUS RENDER */}
                        {isAdmin ? (
                          <select
                            className={`form-select form-select-sm rounded-pill px-3 fw-bold ${
                              currentPaymentStatus === "SUCCESS"
                                ? "bg-success text-white"
                                : currentPaymentStatus === "FAILED"
                                ? "bg-danger text-white"
                                : currentPaymentStatus === "REFUNDED"
                                ? "bg-info text-white"
                                : "bg-warning text-dark"
                            }`}
                            style={{ width: "130px", cursor: isPaymentTerminal ? "not-allowed" : "pointer" }}
                            value={currentPaymentStatus}
                            disabled={updatingPaymentId === currentOrderId || isPaymentTerminal}
                            onChange={(e) => handlePaymentStatusUpdate(currentOrderId, currentPaymentStatus, e.target.value)}
                          >
                            {PAYMENT_STATUSES.map((pStatus) => (
                              <option 
                                key={pStatus} 
                                value={pStatus}
                                className="bg-white text-dark"
                              >
                                {pStatus}
                              </option>
                            ))}
                          </select>
                        ) : (
                          getPaymentBadge(currentPaymentStatus)
                        )}

                        {getPaymentMethodBadge(paymentMethod)}
                        {transactionId && <span className="text-muted small ms-1">(Txn: {transactionId})</span>}
                      </div>

                      <div className="text-end">
                        <span className="text-muted me-2">Total Amount:</span>
                        <span className="fw-bold text-success fs-5">
                          ₹{Number(order.totalAmount || order.totalPrice || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}