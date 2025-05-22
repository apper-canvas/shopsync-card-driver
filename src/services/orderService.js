/**
 * Order Service
 * Provides CRUD operations for order data
 */

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Create order
    const params = {
      records: [{
        Name: orderData.Name || `Order ${new Date().toISOString()}`,
        user: orderData.user,
        total: orderData.total || 0,
        status: orderData.status || 'pending'
      }]
    };

    const response = await apperClient.createRecord('order', params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error('Failed to create order');
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get orders for a user
export const getUserOrders = async (userId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Query for user's orders
    const params = {
      fields: ['Id', 'Name', 'total', 'status', 'CreatedOn'],
      where: [
        {
          fieldName: 'user',
          operator: 'ExactMatch',
          values: [userId]
        }
      ],
      orderBy: [{ fieldName: 'CreatedOn', SortType: 'DESC' }]
    };

    const response = await apperClient.fetchRecords('order', params);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const response = await apperClient.getRecordById('order', orderId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Update order status
    const params = {
      records: [{
        Id: orderId,
        status: status
      }]
    };

    const response = await apperClient.updateRecord('order', params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    
    throw new Error('Failed to update order status');
  } catch (error) {
    console.error(`Error updating order status for order ${orderId}:`, error);
    throw error;
  }
};