import React, { useState, useEffect, useMemo } from "react";
import {
  FaWallet,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaUndo,
  FaSync,
  FaCreditCard,
  FaMoneyBillWave,
  FaUniversity,
  FaExclamationTriangle
} from "react-icons/fa";
import paymentService from "../../services/paymentService";

const PaymentDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedMethod, setSelectedMethod] = useState("ALL");

  // Modal State
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [targetStatus, setTargetStatus] = useState("SUCCESS");
  const [showModal, setShowModal] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(false);

  // Fetch real payment list from backend
  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await paymentService.getAllPayments();
      const data = Array.isArray(response) ? response : response?.content || [];
      setPayments(data);
    } catch (err) {
      console.error("Failed to load payments from API:", err);
      setError("Failed to fetch payment records from server. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Update payment status using orderId (matching backend: PUT /api/payments/{orderId}/status?status=...)
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setProcessingStatus(true);
    try {
      const updatedResponse = await paymentService.updatePaymentStatus(
        selectedPayment.orderId,
        targetStatus
      );

      // Refresh list locally
      setPayments((prev) =>
        prev.map((p) =>
          p.orderId === selectedPayment.orderId
            ? { ...p, ...updatedResponse, paymentStatus: targetStatus, status: targetStatus }
            : p
        )
      );

      setShowModal(false);
      setSelectedPayment(null);
    } catch (err) {
      console.error("Failed to update status via backend:", err);
      alert("Failed to update payment status. Please check backend logs.");
    } finally {
      setProcessingStatus(false);
    }
  };

  // Metrics based on PaymentResponse DTO
  const metrics = useMemo(() => {
    const totalRevenue = payments
      .filter((p) => (p.paymentStatus || p.status) === "SUCCESS")
      .reduce((sum, p) => sum + (p.amount || p.totalAmount || 0), 0);

    const pendingAmount = payments
      .filter((p) => (p.paymentStatus || p.status) === "PENDING")
      .reduce((sum, p) => sum + (p.amount || p.totalAmount || 0), 0);

    const totalSuccessful = payments.filter((p) => (p.paymentStatus || p.status) === "SUCCESS").length;
    const totalFailed = payments.filter((p) => (p.paymentStatus || p.status) === "FAILED").length;
    const totalRefunded = payments.filter((p) => (p.paymentStatus || p.status) === "REFUNDED").length;

    return { totalRevenue, pendingAmount, totalSuccessful, totalFailed, totalRefunded };
  }, [payments]);

  // Search & Filter against PaymentResponse fields
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const status = p.paymentStatus || p.status || "";
      const method = p.paymentMethod || p.method || "";
      const pId = String(p.id || p.paymentId || "");
      const orderId = String(p.orderId || "");
      const txnRef = p.transactionRef || p.transactionId || "";

      const matchesSearch =
        pId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txnRef.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === "ALL" || status === selectedStatus;
      const matchesMethod = selectedMethod === "ALL" || method === selectedMethod;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchQuery, selectedStatus, selectedMethod]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2">
            <FaCheckCircle className="me-1" /> Success
          </span>
        );
      case "PENDING":
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3 py-2">
            <FaClock className="me-1" /> Pending
          </span>
        );
      case "FAILED":
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-2">
            <FaTimesCircle className="me-1" /> Failed
          </span>
        );
      case "REFUNDED":
        return (
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-3 py-2">
            <FaUndo className="me-1" /> Refunded
          </span>
        );
      default:
        return <span className="badge bg-light text-dark">{status || "UNKNOWN"}</span>;
    }
  };

  const renderMethodIcon = (method) => {
    switch (method) {
      case "UPI":
        return <span className="badge bg-primary-subtle text-primary fw-semibold"><FaWallet className="me-1" /> UPI</span>;
      case "CREDIT_CARD":
      case "CARD":
        return <span className="badge bg-info-subtle text-info fw-semibold"><FaCreditCard className="me-1" /> Card</span>;
      case "NET_BANKING":
        return <span className="badge bg-purple-subtle text-purple fw-semibold"><FaUniversity className="me-1" /> Net Banking</span>;
      case "COD":
        return <span className="badge bg-dark-subtle text-dark fw-semibold"><FaMoneyBillWave className="me-1" /> COD</span>;
      default:
        return <span className="badge bg-light text-dark">{method || "N/A"}</span>;
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Admin Payment Dashboard</h2>
          <p className="text-muted small mb-0">Connected to <code>PaymentController</code> endpoints</p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="btn btn-outline-success rounded-pill px-4 d-inline-flex align-items-center gap-2"
        >
          <FaSync className={loading ? "spin" : ""} /> {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger rounded-4 d-flex align-items-center gap-2 mb-4">
          <FaExclamationTriangle />
          <div>{error}</div>
        </div>
      )}

      {/* Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Total Settled</span>
              <div className="p-2 bg-success-subtle text-success rounded-circle">
                <FaWallet className="fs-5" />
              </div>
            </div>
            <h3 className="fw-bold text-dark mb-1">₹{metrics.totalRevenue.toLocaleString("en-IN")}</h3>
            <span className="text-success small fw-semibold">
              <FaCheckCircle className="me-1" /> {metrics.totalSuccessful} Settled
            </span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Pending Amount</span>
              <div className="p-2 bg-warning-subtle text-warning rounded-circle">
                <FaClock className="fs-5" />
              </div>
            </div>
            <h3 className="fw-bold text-dark mb-1">₹{metrics.pendingAmount.toLocaleString("en-IN")}</h3>
            <span className="text-warning small fw-semibold">Unprocessed</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Failed Payments</span>
              <div className="p-2 bg-danger-subtle text-danger rounded-circle">
                <FaTimesCircle className="fs-5" />
              </div>
            </div>
            <h3 className="fw-bold text-dark mb-1">{metrics.totalFailed}</h3>
            <span className="text-danger small fw-semibold">Failures</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Total Refunded</span>
              <div className="p-2 bg-secondary-subtle text-secondary rounded-circle">
                <FaUndo className="fs-5" />
              </div>
            </div>
            <h3 className="fw-bold text-dark mb-1">{metrics.totalRefunded}</h3>
            <span className="text-secondary small fw-semibold">Refunded</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-secondary">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search Payment ID, Order ID, Transaction Ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-secondary">
                <FaFilter />
              </span>
              <select
                className="form-select bg-light border-start-0"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <select
              className="form-select bg-light"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="ALL">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="COD">COD</option>
            </select>
          </div>

          <div className="col-12 col-md-1">
            <button
              className="btn btn-outline-secondary w-100 rounded-pill px-2"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("ALL");
                setSelectedMethod("ALL");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Payment ID / Ref</th>
                <th>Order ID</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const paymentId = p.paymentId || p.id || "N/A";
                  const orderId = p.orderId || "N/A";
                  const status = p.paymentStatus || p.status || "PENDING";
                  const method = p.paymentMethod || p.method || "COD";
                  const amount = p.amount || p.totalAmount || 0;
                  const txnRef = p.transactionRef || p.transactionId || "N/A";

                  return (
                    <tr key={paymentId}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">#{paymentId}</div>
                        <div className="text-muted small">{txnRef}</div>
                      </td>

                      <td className="fw-semibold text-secondary">#{orderId}</td>

                      <td>{renderMethodIcon(method)}</td>

                      <td className="fw-bold text-dark">₹{Number(amount).toFixed(2)}</td>

                      <td>{renderStatusBadge(status)}</td>

                      <td className="text-end pe-4">
                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm rounded-pill px-3"
                          onClick={() => {
                            setSelectedPayment(p);
                            setTargetStatus(status === "PENDING" ? "SUCCESS" : "REFUNDED");
                            setShowModal(false);
                            setShowModal(true);
                          }}
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedPayment && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Update Payment Status</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleStatusUpdate}>
                <div className="modal-body py-3">
                  <p className="text-muted small mb-3">
                    Updating status for Order ID <strong>#{selectedPayment.orderId}</strong>
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">New Payment Status</label>
                    <select
                      className="form-select"
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value)}
                    >
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="PENDING">PENDING</option>
                      <option value="FAILED">FAILED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4"
                    disabled={processingStatus}
                  >
                    {processingStatus ? "Updating..." : "Save Status"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;