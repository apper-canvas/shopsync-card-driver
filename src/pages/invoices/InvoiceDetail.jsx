import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '../../components/ApperIcon';
import { AuthContext } from '../../App';
import { getInvoiceById, updateInvoice } from '../../services/invoiceService';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please log in to view invoice details');
      navigate(`/login?redirect=/invoices/${id}`);
    }
  }, [isAuthenticated, id, navigate]);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!id || !isAuthenticated) return;
      
      setLoading(true);
      try {
        const invoiceData = await getInvoiceById(id);
        setInvoice(invoiceData);
        setError(null);
      } catch (err) {
        console.error('Error fetching invoice details:', err);
        setError(err.message || 'Failed to load invoice details');
        toast.error('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoiceDetails();
  }, [id, isAuthenticated]);

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    setUpdateLoading(true);
    try {
      const updatedInvoice = await updateInvoice(id, { status: newStatus });
      setInvoice(updatedInvoice);
      toast.success(`Invoice status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating invoice status:', err);
      toast.error('Failed to update invoice status');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'draft':
        return 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-200';
      default:
        return 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-200';
    }
  };

  // Handle print invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  // Handle download invoice
  const handleDownloadInvoice = () => {
    toast.info('Downloading invoice...');
    // In a real implementation, this would generate and download a PDF
    setTimeout(() => {
      toast.success('Invoice downloaded successfully');
    }, 1500);
  };

  // Handle send invoice by email
  const handleSendInvoice = () => {
    toast.info('Sending invoice by email...');
    // In a real implementation, this would send the invoice by email
    setTimeout(() => {
      toast.success('Invoice sent successfully');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen py-20">
        <ApperIcon name="Loader" className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ApperIcon name="AlertTriangle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Error Loading Invoice</h3>
        <p className="text-surface-600 dark:text-surface-400 mb-4">{error}</p>
        <div className="flex justify-center space-x-4">
          <button onClick={() => navigate('/invoices')} className="btn-outline">
            Back to Invoices
          </button>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ApperIcon name="FileQuestion" className="h-16 w-16 text-surface-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Invoice Not Found</h3>
        <p className="text-surface-600 dark:text-surface-400 mb-4">The requested invoice could not be found</p>
        <Link to="/invoices" className="btn-primary">Back to Invoices</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl print:py-0" id="invoice-print-section">
      {/* Action Bar - hidden when printing */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex items-center space-x-2">
          <Link to="/invoices" className="btn-outline py-2">
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h1 className="text-2xl font-bold">Invoice #{invoice.invoiceNumber || `INV-${invoice.Id}`}</h1>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrintInvoice} 
            className="btn-outline py-2"
            disabled={updateLoading}
          >
            <ApperIcon name="Printer" className="h-4 w-4 mr-1" />
            Print
          </button>
          <button 
            onClick={handleDownloadInvoice} 
            className="btn-outline py-2"
            disabled={updateLoading}
          >
            <ApperIcon name="Download" className="h-4 w-4 mr-1" />
            Download
          </button>
          <button 
            onClick={handleSendInvoice} 
            className="btn-outline py-2"
            disabled={updateLoading}
          >
            <ApperIcon name="Mail" className="h-4 w-4 mr-1" />
            Email
          </button>
          <Link to={`/invoices/${id}/edit`} className="btn-primary py-2">
            <ApperIcon name="Edit" className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </div>
      </div>
      
      {/* Invoice Document */}
      <div className="bg-white dark:bg-surface-800 shadow-card rounded-xl overflow-hidden p-8 print:shadow-none print:p-0">
        {/* Header with logo and invoice info */}
        <div className="flex justify-between border-b border-surface-200 dark:border-surface-700 pb-6 mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                <ApperIcon name="ShoppingBag" className="h-5 w-5" />
              </span>
              <span className="text-2xl font-bold">ShopSync</span>
            </div>
            <p className="text-surface-600 dark:text-surface-400">123 Commerce Street</p>
            <p className="text-surface-600 dark:text-surface-400">New York, NY 10001</p>
            <p className="text-surface-600 dark:text-surface-400">contact@shopsync.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold mb-2">INVOICE</h2>
            <p className="text-surface-600 dark:text-surface-400 mb-1">
              <strong>Invoice #:</strong> {invoice.invoiceNumber || `INV-${invoice.Id}`}
            </p>
            <p className="text-surface-600 dark:text-surface-400 mb-1">
              <strong>Issue Date:</strong> {formatDate(invoice.issueDate)}
            </p>
            <p className="text-surface-600 dark:text-surface-400 mb-1">
              <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
            </p>
            <p className="text-surface-600 dark:text-surface-400">
              <strong>Status:</strong> 
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}>
                {invoice.status || 'Unknown'}
              </span>
            </p>
          </div>
        </div>
        
        {/* Customer Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
          <p className="font-medium">{invoice.customer || 'Customer Name'}</p>
          <p className="text-surface-600 dark:text-surface-400">
            {invoice.customerAddress || 'Customer Address'}
          </p>
          <p className="text-surface-600 dark:text-surface-400">
            {invoice.customerEmail || 'customer@example.com'}
          </p>
        </div>
        
        {/* Order Reference */}
        {invoice.orderId && (
          <div className="mb-6">
            <p className="text-surface-600 dark:text-surface-400">
              <strong>Order Reference:</strong> {invoice.orderId}
            </p>
          </div>
        )}
        
        {/* Invoice Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Items:</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-100 dark:bg-surface-700 text-left">
                <tr>
                  <th className="py-2 px-4 text-sm font-medium text-surface-700 dark:text-surface-300">Description</th>
                  <th className="py-2 px-4 text-sm font-medium text-surface-700 dark:text-surface-300">Quantity</th>
                  <th className="py-2 px-4 text-sm font-medium text-surface-700 dark:text-surface-300">Unit Price</th>
                  <th className="py-2 px-4 text-sm font-medium text-surface-700 dark:text-surface-300 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {invoice.items ? (
                  // Parse items if it's a string, otherwise use as is
                  (typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items).map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4">{item.description || item.name}</td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">${Number(item.unitPrice || item.price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">${Number(item.quantity * (item.unitPrice || item.price)).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 px-4 text-center text-surface-500">No items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Totals */}
        <div className="border-t border-surface-200 dark:border-surface-700 pt-4 mb-6">
          <div className="flex justify-end">
            <div className="w-1/2 md:w-1/3">
              <div className="flex justify-between py-2">
                <span className="font-medium">Subtotal:</span>
                <span>${Number(invoice.subtotal || invoice.total || 0).toFixed(2)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between py-2">
                  <span className="font-medium">Tax:</span>
                  <span>${Number(invoice.tax || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-surface-200 dark:border-surface-700 font-bold">
                <span>Total:</span>
                <span>${Number(invoice.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Notes:</h3>
            <p className="text-surface-600 dark:text-surface-400 whitespace-pre-line">
              {invoice.notes}
            </p>
          </div>
        )}
        
        {/* Payment Information */}
        <div className="bg-surface-50 dark:bg-surface-750 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Payment Information:</h3>
          <p className="text-surface-600 dark:text-surface-400">Please make payment to the following account:</p>
          <p className="text-surface-600 dark:text-surface-400">Bank: Commerce Bank</p>
          <p className="text-surface-600 dark:text-surface-400">Account: 1234567890</p>
          <p className="text-surface-600 dark:text-surface-400">Reference: {invoice.invoiceNumber || `INV-${invoice.Id}`}</p>
        </div>
      </div>
      
      {/* Status Update Buttons - Hidden when printing */}
      {invoice.status !== 'paid' && (
        <div className="mt-6 flex justify-end space-x-4 print:hidden">
          {invoice.status === 'draft' && (
            <button 
              onClick={() => handleStatusUpdate('pending')} 
              className="btn-primary py-2"
              disabled={updateLoading}
            >
              {updateLoading ? <ApperIcon name="Loader" className="animate-spin h-4 w-4 mr-1" /> : null}
              Mark as Pending
            </button>
          )}
          {invoice.status === 'pending' && (
            <button 
              onClick={() => handleStatusUpdate('paid')} 
              className="btn-primary py-2"
              disabled={updateLoading}
            >
              {updateLoading ? <ApperIcon name="Loader" className="animate-spin h-4 w-4 mr-1" /> : null}
              Mark as Paid
            </button>
          )}
          {invoice.status === 'overdue' && (
            <button 
              onClick={() => handleStatusUpdate('paid')} 
              className="btn-primary py-2"
              disabled={updateLoading}
            >
              {updateLoading ? <ApperIcon name="Loader" className="animate-spin h-4 w-4 mr-1" /> : null}
              Mark as Paid
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;