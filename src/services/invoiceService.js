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
        "invoiceNumber", "invoiceDate", "dueDate", "customer", "totalAmount", 
        "status", "order", "items", "notes", "customerEmail", "customerAddress",
        "subtotal", "tax", "total", "issueDate"
        
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
          operator: "ExactMatch",
          values: [filters.customer]
        });
      }

      if (filters.dateRange && filters.dateRange.start) {
        params.where.push({
          fieldName: "issueDate",
          operator: "GreaterThanOrEqualTo",
          values: [filters.dateRange.start]
        });
        if (filters.dateRange.end) {
        params.where.push({
          fieldName: "issueDate",
          operator: "LessThanOrEqualTo",
          values: [filters.dateRange.end]
        });
      }
    }
      
      // Add pagination if needed
      if (filters.pagingInfo) {
        params.pagingInfo = {
          limit: filters.pagingInfo.limit || 20,
          offset: filters.pagingInfo.offset || 0
        };
      }
      
      // Add search if provided
      if (filters.search) {
        // Create a whereGroup for search across multiple fields
        params.whereGroups = [
          {
            operator: "OR",
            subGroups: [
              {
                conditions: [{
                  fieldName: "invoiceNumber",
                  operator: "Contains",
                  values: [filters.search]
                }],
                operator: ""
              },
              {
                conditions: [{
                  fieldName: "customer",
                  operator: "Contains",
                  values: [filters.search]
                }],
                operator: ""
              }
            ]
          }
        ];
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
        "invoiceNumber", "invoiceDate", "dueDate", "customer", "totalAmount", 
        "status", "order", "items", "notes", "customerEmail", "customerAddress",
        "subtotal", "tax", "total", "issueDate"
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
    // Process invoice data
    const processedInvoiceData = {
      Name: invoiceData.Name || `Invoice for ${invoiceData.customer}`,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.issueDate,
      dueDate: invoiceData.dueDate,
      customer: invoiceData.customer,
      totalAmount: invoiceData.total,
      status: invoiceData.status,
      order: invoiceData.order || null,
      items: typeof invoiceData.items === 'string' ? invoiceData.items : JSON.stringify(invoiceData.items),
      notes: invoiceData.notes,
      customerEmail: invoiceData.customerEmail,
      customerAddress: invoiceData.customerAddress,
      subtotal: invoiceData.subtotal,
      tax: invoiceData.tax,
      total: invoiceData.total,
      Owner: invoiceData.Owner
    };


      records: [processedInvoiceData]
      records: [invoiceData]
    };

    const response = await apperClient.createRecord('invoice', params);
      toast.success("Invoice created successfully");
    } else {
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

    // Process update data
    const processedUpdateData = {
      Id: id
    };
    
    // Only include fields that are present in updateData
    if (updateData.Name) processedUpdateData.Name = updateData.Name;
    if (updateData.invoiceNumber) processedUpdateData.invoiceNumber = updateData.invoiceNumber;
    if (updateData.invoiceDate) processedUpdateData.invoiceDate = updateData.invoiceDate;
    if (updateData.issueDate) processedUpdateData.invoiceDate = updateData.issueDate;
    if (updateData.dueDate) processedUpdateData.dueDate = updateData.dueDate;
    if (updateData.customer) processedUpdateData.customer = updateData.customer;
    if (updateData.totalAmount !== undefined) processedUpdateData.totalAmount = updateData.totalAmount;
    if (updateData.status) processedUpdateData.status = updateData.status;
    if (updateData.order) processedUpdateData.order = updateData.order;
    if (updateData.items) processedUpdateData.items = typeof updateData.items === 'string' ? updateData.items : JSON.stringify(updateData.items);
    if (updateData.notes !== undefined) processedUpdateData.notes = updateData.notes;
    if (updateData.customerEmail !== undefined) processedUpdateData.customerEmail = updateData.customerEmail;
    if (updateData.customerAddress !== undefined) processedUpdateData.customerAddress = updateData.customerAddress;
    if (updateData.subtotal !== undefined) processedUpdateData.subtotal = updateData.subtotal;
    if (updateData.tax !== undefined) processedUpdateData.tax = updateData.tax;
    if (updateData.total !== undefined) processedUpdateData.total = updateData.total;

    const params = { records: [processedUpdateData] };
    const response = await apperClient.updateRecord('invoice', params);
    
    if (response.success && response.results && response.results[0].success) {
      toast.success("Invoice updated successfully");
      return response.results[0].data;
    } else {
      throw new Error(response.results?.[0]?.message || "Failed to update invoice");
    }
  } catch (error) {
    console.error(`Error updating invoice #${id}:`, error);
    toast.error(error.message || "Failed to update invoice");
    throw new Error(error.message || "Failed to update invoice");
  }
};

/**
 * Delete an invoice
 * @param {number} id - Invoice ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteInvoice = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = { RecordIds: [id] };
    const response = await apperClient.deleteRecord('invoice', params);
    
    if (response.success) {
      toast.success("Invoice deleted successfully");
      return true;
    } else {
      throw new Error(response.message || "Failed to delete invoice");
    }
  } catch (error) {
    console.error(`Error deleting invoice #${id}:`, error);
    toast.error(error.message || "Failed to delete invoice");
    throw new Error(error.message || "Failed to delete invoice");
  }
};