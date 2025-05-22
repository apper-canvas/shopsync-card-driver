import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '../../components/ApperIcon';
import { AuthContext } from '../../App';
import { getInvoiceById, updateInvoice } from '../../services/invoiceService';
import { fetchInvoiceItems } from '../../services/invoiceItemService';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [invoice, setInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: ''
  });
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please log in to view invoice details');
      navigate(`/login?redirect=/invoices/${id}`);
    }
  }, [isAuthenticated, navigate, id]);

  // Fetch invoice and items data
  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      try {
        // Fetch invoice details
        const invoiceData = await getInvoiceById(id);
        setInvoice(invoiceData);
        
        // Fetch invoice items
        const items = await fetchInvoiceItems(id);
        setInvoiceItems(items);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching invoice details:', err);
        setError(err.message || 'Failed to load invoice details');
        toast.error('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchInvoiceData();
    }
  }, [id, isAuthenticated]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Invoice status badge styles
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
      case 'cancelled':
        return 'bg-surface-200 text-surface-800 dark:bg-surface-600 dark:text-surface-200';
      default:
        return 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-200';
    }
  };

  // Update invoice status
  const updateStatus = async (newStatus) => {
    setStatusLoading(true);
    try {
      await updateInvoice(id, { status: newStatus });
      setInvoice(prev => ({ ...prev, status: newStatus }));
      toast.success(`Invoice status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating invoice status:', err);
      toast.error('Failed to update invoice status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle email form input changes
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle email send action
  const handleSendEmail = (e) => {
    e.preventDefault();
    toast.info('Email functionality will be implemented in the next phase');
    setShowSendEmailModal(false);
  };

  // Generate PDF (placeholder for now)
  const generatePDF = () => {
    toast.info('PDF generation will be implemented in the next phase');
  };

  // Parse invoice items if they are stored as a JSON string
  const getParsedInvoiceItems = () => {
    // If we have fetched actual invoice items, use those
    if (invoiceItems && invoiceItems.length > 0) {
      return invoiceItems;
    }
    
    // Otherwise, try to parse from invoice.items if it's a string
    if (invoice?.items && typeof invoice.items === 'string') {
      try {
        return JSON.parse(invoice.items);
      } catch (e) {
        console.error('Failed to parse invoice items:', e);
        return [];
      }
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <ApperIcon name="Loader" className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <ApperIcon name="AlertTriangle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Failed to load invoice</h3>
          <p className="text-surface-600 dark:text-surface-400 mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => navigate('/invoices')} 
              className="btn-outline"
            >
              Back to Invoices
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <ApperIcon name="FileText" className="h-16 w-16 text-surface-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Invoice not found</h3>
          <p className="text-surface-600 dark:text-surface-400 mb-4">The requested invoice could not be found.</p>
          <Link to="/invoices" className="btn-primary">
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const items = getParsedInvoiceItems();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Link to="/invoices" className="btn-outline py-2">
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber || `#${invoice.Id}`}</h1>
        </div>
        <div className="flex space-x-2">
          <button onClick={generatePDF} className="btn-outline py-2">
            <ApperIcon name="Download" className="h-4 w-4 mr-1" />
            Download PDF
          </button>
          <button onClick={() => setShowSendEmailModal(true)} className="btn-outline py-2">
            <ApperIcon name="Mail" className="h-4 w-4 mr-1" />
            Send Email
          </button>
          <Link to={`/invoices/${id}/edit`} className="btn-primary py-2">
            <ApperIcon name="Edit" className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </div>
      </div>

      {/* Status banner */}
      <div className={`mb-6 p-4 rounded-lg flex justify-between items-center ${getStatusBadgeClass(invoice.status)}`}>
        <div className="flex items-center">
          <span className="font-semibold mr-2">Status:</span>
          <span className="capitalize">{invoice.status || 'Unknown'}</span>
        </div>
        <div className="flex space-x-2">
          {invoice.status !== 'paid' && (
            <button 
              onClick={() => updateStatus('paid')} 
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
              disabled={statusLoading}
            >
              {statusLoading ? <ApperIcon name="Loader" className="animate-spin h-4 w-4 mr-1" /> : <ApperIcon name="CheckCircle" className="h-4 w-4 mr-1" />}
              Mark as Paid
            </button>
          )}
          {invoice.status !== 'draft' && invoice.status !== 'cancelled' && (
            <button 
              onClick={() => updateStatus('cancelled')} 
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
              disabled={statusLoading}
            >
              {statusLoading ? <ApperIcon name="Loader" className="animate-spin h-4 w-4 mr-1" /> : <ApperIcon name="XCircle" className="h-4 w-4 mr-1" />}
              Cancel Invoice
            </button>
          )}
        </div>
      </div>

      {/* Invoice details */}
      <div className="bg-white dark:bg-surface-800 shadow-card rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invoice Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Invoice Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-surface-600 dark:text-surface-400">Invoice Number:</span>
                <span className="font-medium">{invoice.invoiceNumber || `#${invoice.Id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600 dark:text-surface-400">Issue Date:</span>
                <span>{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600 dark:text-surface-400">Due Date:</span>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
          
          {/* Customer Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <div>
                <span className="text-surface-600 dark:text-surface-400">Customer:</span>
                <span className="block font-medium">{invoice.customer || 'N/A'}</span>
              </div>
              {invoice.customerEmail && (
                <div>
                  <span className="text-surface-600 dark:text-surface-400">Email:</span>
                  <span className="block">{invoice.customerEmail}</span>
                </div>
              )}
              {invoice.customerAddress && (
                <div>
                  <span className="text-surface-600 dark:text-surface-400">Address:</span>
                  <address className="block not-italic">{invoice.customerAddress}</address>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="bg-white dark:bg-surface-800 shadow-card rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Invoice Items</h2>
        
        {items.length === 0 ? (
          <p className="text-center py-4 text-surface-500">No items in this invoice.</p>
        ) : (
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
                {items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="py-3 px-4">{item.description}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4">${Number(item.unitPrice).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${Number(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-surface-200 dark:border-surface-700">
                <tr>
                  <td colSpan="3" className="py-3 px-4 text-right font-medium">Subtotal:</td>
                  <td className="py-3 px-4 text-right">${Number(invoice.subtotal || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="py-3 px-4 text-right font-medium">Tax:</td>
                  <td className="py-3 px-4 text-right">${Number(invoice.tax || 0).toFixed(2)}</td>
                </tr>
                <tr className="font-bold">
                  <td colSpan="3" className="py-3 px-4 text-right">Total:</td>
                  <td className="py-3 px-4 text-right">${Number(invoice.total || 0).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      
      {/* Notes */}
      {invoice.notes && (
        <div className="bg-white dark:bg-surface-800 shadow-card rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          <p className="text-surface-600 dark:text-surface-400 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}
      
      {/* Activity Timeline (placeholder) */}
      <div className="bg-white dark:bg-surface-800 shadow-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Activity</h2>
        <div className="space-y-4">
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <div className="bg-blue-100 rounded-full p-2 dark:bg-blue-900">
                <ApperIcon name="FileText" className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <div>
              <p className="font-medium">Invoice created</p>
              <p className="text-sm text-surface-500">{formatDate(invoice.CreatedOn)}</p>
            </div>
          </div>
          {invoice.status === 'paid' && (
            <div className="flex">
              <div className="mr-4 flex-shrink-0">
                <div className="bg-green-100 rounded-full p-2 dark:bg-green-900">
                  <ApperIcon name="CheckCircle" className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
              </div>
              <div>
                <p className="font-medium">Invoice marked as paid</p>
                <p className="text-sm text-surface-500">{formatDate(invoice.ModifiedOn)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Email Modal */}
      {showSendEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Send Invoice</h3>
              <button onClick={() => setShowSendEmailModal(false)} className="text-surface-500 hover:text-surface-700">
                <ApperIcon name="X" className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSendEmail}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Email To
                </label>
                <input
                  type="email"
                  name="to"
                  value={emailForm.to || invoice.customerEmail || ''}
                  onChange={handleEmailChange}
                  className="input"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={emailForm.subject || `Invoice ${invoice.invoiceNumber || `#${invoice.Id}`}`}
                  onChange={handleEmailChange}
                  className="input"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={emailForm.message || `Please find attached invoice ${invoice.invoiceNumber || `#${invoice.Id}`}.`}
                  onChange={handleEmailChange}
                  className="input"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setShowSendEmailModal(false)} 
                  className="btn-outline py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;