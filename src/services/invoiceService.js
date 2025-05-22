/**
 * Invoice Service - Handles all invoice-related operations
 */
import { toast } from 'react-toastify';

/**
 * Fetch all invoices with optional filtering
 * @param {Object} filters - Optional filters for invoices
 * @returns {Promise<Array>} - List of invoices
 */
export const fetchInvoices = async (filters = {}) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Build query parameters
    const params = {
      fields: [
        "Id", "Name", "Tags", "Owner", "CreatedOn", "ModifiedOn", 
        "invoiceNumber", "orderId", "customer", "issueDate", 
        "dueDate", "status", "total", "items", "notes"
      ],
      orderBy: [{ fieldName: "CreatedOn", SortType: "DESC" }]
    };

    // Add filters if provided
    if (Object.keys(filters).length > 0) {
      params.where = [];
      
      if (filters.status) {
        params.where.push({
          fieldName: "status",
          operator: "ExactMatch",
          values: [filters.status]
        });
      }
      
      if (filters.customer) {
        params.where.push({
          fieldName: "customer",
          operator: "Contains",
          values: [filters.customer]
        });
      }

      if (filters.dateRange) {
        params.where.push({
          fieldName: "issueDate",
          operator: "GreaterThanOrEqualTo",
          values: [filters.dateRange.start]
        });
        params.where.push({
          fieldName: "issueDate",
          operator: "LessThanOrEqualTo",
          values: [filters.dateRange.end]
        });
      }
    }

    const response = await apperClient.fetchRecords('invoice', params);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw new Error(error.message || "Failed to fetch invoices");
  }
};

/**
 * Get a single invoice by ID
 * @param {number} id - Invoice ID
 * @returns {Promise<Object>} - Invoice details
 */
export const getInvoiceById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: [
        "Id", "Name", "Tags", "Owner", "CreatedOn", "ModifiedOn", 
        "invoiceNumber", "orderId", "customer", "issueDate", 
        "dueDate", "status", "total", "items", "notes"
      ]
    };

    const response = await apperClient.getRecordById('invoice', id, params);
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching invoice #${id}:`, error);
    throw new Error(error.message || "Failed to fetch invoice");
  }
};

/**
 * Create a new invoice
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Object>} - Created invoice
 */
export const createInvoice = async (invoiceData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [invoiceData]
    };

    const response = await apperClient.createRecord('invoice', params);
    if (response.success && response.results && response.results[0].success) {
      toast.success("Invoice created successfully");
      return response.results[0].data;
    } else {
      throw new Error(response.results?.[0]?.message || "Failed to create invoice");
    }
  } catch (error) {
    console.error("Error creating invoice:", error);
    toast.error(error.message || "Failed to create invoice");
    throw error;
  }
};

/**
 * Update an existing invoice
 * @param {number} id - Invoice ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated invoice
 */
export const updateInvoice = async (id, updateData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = { records: [{ Id: id, ...updateData }] };
    const response = await apperClient.updateRecord('invoice', params);
    return response.results[0].data;
  } catch (error) {
    console.error(`Error updating invoice #${id}:`, error);
    throw new Error(error.message || "Failed to update invoice");
  }
};