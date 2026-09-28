import API from "./api";

const CATEGORY_API_URL = "/api/categories";

export const getAllCategories = async () => {
  const response = await API.get(CATEGORY_API_URL);
  return response.data; // List<CategoryResponse>
};

export const getCategoryById = async (id) => {
  const response = await API.get(`${CATEGORY_API_URL}/${id}`);
  return response.data; // CategoryResponse
};

export const createCategory = async (categoryData) => {
  // Requires ROLE_ADMIN
  const response = await API.post(CATEGORY_API_URL, categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  // Requires ROLE_ADMIN
  const response = await API.put(
    `${CATEGORY_API_URL}/${id}`,
    categoryData
  );
  return response.data;
};

export const deleteCategory = async (id) => {
  // Requires ROLE_ADMIN
  const response = await API.delete(`${CATEGORY_API_URL}/${id}`);
  return response.data;
};

const categoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;