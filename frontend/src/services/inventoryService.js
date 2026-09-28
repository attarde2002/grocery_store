import API from "./api";

const INVENTORY_BASE_URL = "/api/inventory";

const inventoryService = {
  /**
   * GET /api/inventory/{productId}
   * Returns InventoryResponse DTO
   */
  getInventoryByProductId: async (productId) => {
    const response = await API.get(`${INVENTORY_BASE_URL}/${productId}`);
    return response.data;
  },

  /**
   * PUT /api/inventory/add-stock/{productId}
   * Body: { quantity: number }
   */
  addStock: async (productId, quantity) => {
    const response = await API.put(
      `${INVENTORY_BASE_URL}/add-stock/${productId}`,
      { quantity }
    );
    return response.data;
  },

  /**
   * PUT /api/inventory/remove-stock/{productId}
   * Body: { quantity: number }
   */
  removeStock: async (productId, quantity) => {
    const response = await API.put(
      `${INVENTORY_BASE_URL}/remove-stock/${productId}`,
      { quantity }
    );
    return response.data;
  },

  /**
   * PUT /api/inventory/restore-stock/{productId}
   * Body: { quantity: number }
   */
  restoreStock: async (productId, quantity) => {
    const response = await API.put(
      `${INVENTORY_BASE_URL}/restore-stock/${productId}`,
      { quantity }
    );
    return response.data;
  },
};

export default inventoryService;