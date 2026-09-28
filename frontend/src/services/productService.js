import API from "./api";

const PRODUCT_API_URL = "/api/products";

export const getAllProducts = async () => {
  const response = await API.get(PRODUCT_API_URL);
  return response.data; // List<ProductResponse>
};

export const getProductById = async (id) => {
  const response = await API.get(`${PRODUCT_API_URL}/${id}`);
  return response.data; // ProductResponse
};

export const createProduct = async (productData) => {
  // Requires ROLE_ADMIN
  console.log(productData);
  const response = await API.post(PRODUCT_API_URL, productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  // Requires ROLE_ADMIN
  const response = await API.put(`${PRODUCT_API_URL}/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  // Requires ROLE_ADMIN
  const response = await API.delete(`${PRODUCT_API_URL}/${id}`);
  return response.data;
};

const productService = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productService;