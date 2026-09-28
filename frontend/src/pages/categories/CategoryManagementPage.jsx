import React, { useEffect, useState, useCallback } from "react";
import { FaTags, FaPlus, FaEdit, FaTrash, FaSync } from "react-icons/fa";
import categoryService from "../../services/categoryService";

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error("Failed to save category:", err);
      const msg = err.response?.data?.message || "Failed to save category.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await categoryService.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category.");
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 py-5 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: "900px" }}>
        
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1">Category Management</h2>
            <p className="text-secondary mb-0">Organize and manage store categories</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary rounded-pill px-3" onClick={fetchCategories}>
              <FaSync className="me-1" /> Refresh
            </button>
            <button className="btn btn-success rounded-pill px-3" onClick={() => handleOpenModal()}>
              <FaPlus className="me-1" /> Add Category
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger rounded-3 mb-4">{error}</div>}

        {/* Categories Table */}
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light text-secondary small">
                <tr>
                  <th className="ps-4">ID</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No categories found. Click "Add Category" to create one.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="ps-4 fw-semibold text-muted">#{cat.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2 fw-semibold text-dark">
                          <FaTags className="text-success" />
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="text-secondary small">
                        {cat.description || "No description provided."}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-inline-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            onClick={() => handleOpenModal(cat)}
                          >
                            <FaEdit className="me-1" /> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                            onClick={() => handleDelete(cat.id)}
                          >
                            <FaTrash className="me-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Backdrop & Dialog */}
        {showModal && (
          <div className="modal fade show d-block tab-index-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body py-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Category Name</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Dairy & Eggs"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea
                        className="form-control rounded-3"
                        rows="3"
                        placeholder="Optional description..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success rounded-pill px-4" disabled={saving}>
                      {saving ? "Saving..." : "Save Category"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}