/**
 * Invoice Item Service - Handles all invoice item-related operations
 */
import { toast } from 'react-toastify';

/**
 * Fetch invoice items for a specific invoice
 * @param {number} invoiceId - ID of the invoice
 * @returns {Promise<Array>} - List of invoice items
 */
export const fetchInvoiceItems = async (invoiceId) => {
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
        "invoice", "product", "quantity", "unitPrice", "amount", "description"
      ],
      where: [
        {
          fieldName: "invoice",
          operator: "ExactMatch",
          values: [invoiceId]
        }
      ],
      orderBy: [{ fieldName: "Id", SortType: "ASC" }]
    };

    const response = await apperClient.fetchRecords('invoice_item', params);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching invoice items for invoice #${invoiceId}:`, error);
    throw new Error(error.message || "Failed to fetch invoice items");
  }
};

/**
 * Create invoice items for a new invoice
 * @param {number} invoiceId - ID of the invoice
 * @param {Array} items - Array of invoice item data
 * @returns {Promise<Array>} - Created invoice items
 */
export const createInvoiceItems = async (invoiceId, items) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const recordsToCreate = items.map(item => ({
      Name: item.description,
      invoice: invoiceId,
      product: item.product || null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice,
      description: item.description
    }));

    const params = {
      records: recordsToCreate
    };

    const response = await apperClient.createRecord('invoice_item', params);
    
    if (response.success && response.results) {
      const successfulItems = response.results.filter(result => result.success);
      return successfulItems.map(result => result.data);
    } else {
      throw new Error("Failed to create invoice items");
    }
  } catch (error) {
    console.error("Error creating invoice items:", error);
    throw new Error(error.message || "Failed to create invoice items");
  }
};

/**
 * Update an existing invoice item
 * @param {number} id - Invoice item ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated invoice item
 */
export const updateInvoiceItem = async (id, updateData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Calculate amount based on quantity and unitPrice if they are provided
    if (updateData.quantity !== undefined && updateData.unitPrice !== undefined) {
      updateData.amount = updateData.quantity * updateData.unitPrice;
    }

    const params = { 
      records: [{ 
        Id: id, 
        ...updateData 
      }] 
    };
    
    const response = await apperClient.updateRecord('invoice_item', params);
    
    if (response.success && response.results && response.results[0].success) {
      return response.results[0].data;
    } else {
      throw new Error(response.results?.[0]?.message || "Failed to update invoice item");
    }
  } catch (error) {
    console.error(`Error updating invoice item #${id}:`, error);
    throw new Error(error.message || "Failed to update invoice item");
  }
};

/**
 * Delete an invoice item
 * @param {number} id - Invoice item ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteInvoiceItem = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = { RecordIds: [id] };
    const response = await apperClient.deleteRecord('invoice_item', params);
    return response.success;
  } catch (error) {
    console.error(`Error deleting invoice item #${id}:`, error);
    throw new Error(error.message || "Failed to delete invoice item");
  }
};