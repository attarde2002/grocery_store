import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';

const INITIAL_FORM_STATE = {
  name: '',
  categoryId: '',
  brand: '',
  price: '',
  description: '',
};

export default function AddProductPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [imageBase64, setImageBase64] = useState('');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [createdProduct, setCreatedProduct] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Please refresh the page.');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reads the selected file and converts it into a Base64 Data URL string
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageBase64('');
      return;
    }

    // Optional: Limit image size to prevent huge DB payloads (e.g., 2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('Selected image is too large. Please choose an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result); // Produces string: "data:image/jpeg;base64,/9j/4AAQSk..."
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setImageBase64('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreatedProduct(null);

    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!formData.categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError('Price must be a valid positive number.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      categoryId: Number(formData.categoryId),
      brand: formData.brand.trim() || null,
      price: parseFloat(formData.price),
      imageUrl: imageBase64 || null, // Sends full Base64 string directly to DB
      description: formData.description.trim() || null,
    };

    setLoading(true);

    try {
      const responseData = await productService.createProduct(payload);
      setCreatedProduct(responseData);
      handleReset();
    } catch (err) {
      console.error('Error adding product:', err);
      setError(
        err.response?.data?.message || 'Failed to add product. Please check your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '800px' }}>
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h2 className="h4 mb-0 text-dark font-weight-bold">Add New Product</h2>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn btn-outline-secondary btn-sm"
          >
            Back to List
          </button>
        </div>

        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {createdProduct && (
            <div className="alert alert-success" role="alert">
              <h5 className="alert-heading h6 mb-2">
                ✓ Product Created Successfully! (ID: #{createdProduct.id})
              </h5>
              <div className="row text-muted small">
                <div className="col-6"><strong>Name:</strong> {createdProduct.name}</div>
                <div className="col-6"><strong>Category:</strong> {createdProduct.categoryName || createdProduct.categoryId}</div>
                <div className="col-6"><strong>Brand:</strong> {createdProduct.brand || 'N/A'}</div>
                <div className="col-6"><strong>Price:</strong> ${createdProduct.price?.toFixed(2)}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">
                Product Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Organic Whole Milk"
                required
                className="form-control"
              />
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label fw-bold">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  disabled={categoriesLoading}
                  className="form-select"
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Dairy Pure"
                  className="form-control"
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label fw-bold">
                  Price ($) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="3.99"
                  required
                  className="form-control"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="form-control"
                />
              </div>
            </div>

            {imageBase64 && (
              <div className="mb-3 text-center">
                <img
                  src={imageBase64}
                  alt="Product Preview"
                  className="img-thumbnail"
                  style={{ maxHeight: '150px' }}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="form-label fw-bold">Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Fresh whole milk sourced from local farms..."
                className="form-control"
              />
            </div>

            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline-secondary"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-success px-4"
              >
                {loading ? 'Submitting...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}