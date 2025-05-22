/**
 * Cart Item Service
 * Provides CRUD operations for cart item data
 */

// Fetch cart items for a specific cart
export const fetchCartItems = async (cartId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Query for cart items
    const params = {
      fields: ['Id', 'Name', 'quantity', 'price', 'product', 'cart'],
      where: [
        {
          fieldName: 'cart',
          operator: 'ExactMatch',
          values: [cartId]
        }
      ]
    };

    const response = await apperClient.fetchRecords('cart_item', params);
    
    // If we have cart items, fetch the associated products
    if (response.data && response.data.length > 0) {
      // For each cart item, get the product details
      const itemsWithProducts = await Promise.all(response.data.map(async (item) => {
        if (item.product) {
          try {
            const productResponse = await apperClient.getRecordById('product', item.product);
            return {
              ...item,
              product: productResponse.data
            };
          } catch (err) {
            console.error(`Error fetching product for cart item ${item.Id}:`, err);
            return item;
          }
        }
        return item;
      }));
      
      return itemsWithProducts;
    }
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching cart items for cart ${cartId}:`, error);
    throw error;
  }
};

// Add item to cart
export const addCartItem = async (cartItemData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Create new cart item
    const params = {
      records: [{
        Name: cartItemData.Name || `Item in cart ${cartItemData.cart}`,
        quantity: cartItemData.quantity || 1,
        price: cartItemData.price || 0,
        product: cartItemData.product,
        cart: cartItemData.cart
      }]
    };

    const response = await apperClient.createRecord('cart_item', params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error('Failed to add item to cart');
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

// Update cart item
export const updateCartItem = async (cartItemId, cartItemData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Update cart item
    const params = {
      records: [{
        Id: cartItemId,
        ...cartItemData
      }]
    };

    const response = await apperClient.updateRecord('cart_item', params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error('Failed to update cart item');
  } catch (error) {
    console.error(`Error updating cart item ${cartItemId}:`, error);
    throw error;
  }
};

// Remove item from cart
export const removeCartItem = async (cartItemId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Delete cart item
    const params = {
      RecordIds: [cartItemId]
    };

    const response = await apperClient.deleteRecord('cart_item', params);
    
    return response.success;
  } catch (error) {
    console.error(`Error removing cart item ${cartItemId}:`, error);
    throw error;
  }
};

// Get cart item by ID
export const getCartItemById = async (cartItemId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const response = await apperClient.getRecordById('cart_item', cartItemId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cart item with ID ${cartItemId}:`, error);
    throw error;
  }
};