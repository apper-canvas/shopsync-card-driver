/**
 * User Service
 * Provides CRUD operations for user data
 */

// Get the current authenticated user
export const getCurrentUser = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Query the User1 table to get the current user based on email
    const params = {
      fields: ['Id', 'Name', 'email', 'dark_mode'],
      where: [
        {
          fieldName: 'email',
          operator: 'ExactMatch',
          values: [localStorage.getItem('userEmail')]
        }
      ]
    };

    const response = await apperClient.fetchRecords('User1', params);
    if (response && response.data && response.data.length > 0) {
      return response.data[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Only include Updateable fields
    const params = {
      records: [{
        Name: userData.name,
        email: userData.email,
        dark_mode: userData.darkMode || false
      }]
    };

    const response = await apperClient.createRecord('User1', params);
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    throw new Error('Failed to create user');
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const response = await apperClient.getRecordById('User1', userId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
};

// Update user data
export const updateUser = async (userId, userData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = { records: [{ Id: userId, ...userData }] };
    const response = await apperClient.updateRecord('User1', params);
    return response.results[0].data;
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
};