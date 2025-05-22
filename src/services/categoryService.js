/**
 * Category Service
 * Provides CRUD operations for category data
 */

// Fetch all categories
export const fetchCategories = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: ['Id', 'Name', 'Tags'],
      orderBy: [{ fieldName: 'Name', SortType: 'ASC' }]
    };

    const response = await apperClient.fetchRecords('category', params);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get a single category by ID
export const getCategoryById = async (categoryId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const response = await apperClient.getRecordById('category', categoryId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${categoryId}:`, error);
    throw error;
  }
};

// Get products by category ID
export const getProductsByCategory = async (categoryId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: ['Id', 'Name', 'price', 'image', 'rating', 'stock'],
      where: [
        {
          fieldName: 'category',
          operator: 'ExactMatch',
          values: [categoryId]
        }
      ]
    };

    const response = await apperClient.fetchRecords('product', params);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};