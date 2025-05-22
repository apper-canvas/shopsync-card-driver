/**
 * Product Service
 * Provides CRUD operations for product data
 */

// Fetch all products with optional filtering
export const fetchProducts = async (filters = {}) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Set up query parameters
    const params = {
      fields: ['Id', 'Name', 'price', 'image', 'rating', 'stock', 'category'],
      orderBy: [{ fieldName: 'Name', SortType: 'ASC' }],
      pagingInfo: {
        limit: filters.limit || 100,
        offset: filters.offset || 0
      }
    };

    // Add where clauses if filters are provided
    if (filters.category) {
      params.where = [
        {
          fieldName: 'category',
          operator: 'ExactMatch',
          values: [filters.category]
        }
      ];
    }

    if (filters.search) {
      if (!params.where) params.where = [];
      params.where.push({
        fieldName: 'Name',
        operator: 'Contains',
        values: [filters.search]
      });
    }

    if (filters.minPrice || filters.maxPrice) {
      if (!params.where) params.where = [];
      
      if (filters.minPrice) {
        params.where.push({
          fieldName: 'price',
          operator: 'GreaterThanOrEqualTo',
          values: [filters.minPrice]
        });
      }
      
      if (filters.maxPrice) {
        params.where.push({
          fieldName: 'price',
          operator: 'LessThanOrEqualTo',
          values: [filters.maxPrice]
        });
      }
    }

    const response = await apperClient.fetchRecords('product', params);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (productId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: ['Id', 'Name', 'price', 'image', 'rating', 'stock', 'category', 'Tags']
    };
    
    const response = await apperClient.getRecordById('product', productId, params);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Only include Updateable fields
    const params = {
      records: [{
        Name: productData.Name,
        price: productData.price,
        image: productData.image,
        rating: productData.rating,
        stock: productData.stock,
        category: productData.category,
        Tags: productData.Tags
      }]
    };

    const response = await apperClient.createRecord('product', params);
    return response.results[0].data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};