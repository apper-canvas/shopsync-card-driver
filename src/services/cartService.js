/**
 * Cart Service
 * Provides CRUD operations for cart data
 */

// Import cart item service for related operations
import { fetchCartItems } from './cartItemService';

// Get active cart for a user
export const getUserCart = async (userId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Query for active cart
    const params = {
      fields: ['Id', 'Name', 'total', 'status'],
      where: [
        {
          fieldName: 'Owner',
          operator: 'ExactMatch',
          values: [userId]
        },
        {
          fieldName: 'status',
          operator: 'ExactMatch',
          values: ['active']
        }
      ]
    };

    const response = await apperClient.fetchRecords('cart', params);
    
    // Return null if no active cart exists
    if (!response.data || response.data.length === 0) {
      return null;
    }
    
    // Get the active cart
    const cart = response.data[0];
    
    // Fetch cart items for this cart
    const cartItems = await fetchCartItems(cart.Id);
    
    // Return cart with items
    return {
      ...cart,
      items: cartItems
    };
  } catch (error) {
    console.error('Error fetching user cart:', error);
    throw error;
  }
};

// Create a new cart
export const createCart = async (userId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Create a new active cart
    const params = {
      records: [{
        Name: `Cart for user ${userId}`,
        Owner: userId,
        total: 0,
        status: 'active'
      }]
    };

    const response = await apperClient.createRecord('cart', params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error('Failed to create cart');
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
};

// Update cart
export const updateCart = async (cartId, cartData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Update cart with new data
    const params = {
      records: [{
        Id: cartId,
        ...cartData
      }]
    };

    const response = await apperClient.updateRecord('cart', params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error('Failed to update cart');
  } catch (error) {
    console.error(`Error updating cart ${cartId}:`, error);
    throw error;
  }
};

// Get cart by ID
export const getCartById = async (cartId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: ['Id', 'Name', 'total', 'status']
    };
    
    const response = await apperClient.getRecordById('cart', cartId, params);
    
    // Fetch cart items for this cart
    const cartItems = await fetchCartItems(cartId);
    
    // Return cart with items
    return {
      ...response.data,
      items: cartItems
    };
  } catch (error) {
    console.error(`Error fetching cart with ID ${cartId}:`, error);
    throw error;
  }
};