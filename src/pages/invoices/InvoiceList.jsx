import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '../../components/ApperIcon';
import { AuthContext } from '../../App';
import { fetchInvoices, deleteInvoice } from '../../services/invoiceService';

const InvoiceList = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    customer: '',
    dateRange: { start: '', end: '' }
  });
  const [sortBy, setSortBy] = useState('date-desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please log in to view invoices');
      navigate('/login?redirect=/invoices');
    }
  }, [isAuthenticated, navigate]);

  // Fetch invoices
  useEffect(() => {
    const getInvoices = async () => {
      setLoading(true);
      try {
        // Create API filters from the UI filters
        const apiFilters = {
          ...filters,
          search: searchTerm // Add search term to filters
        };
        
        // Fetch invoices with filters
        const invoiceData = await fetchInvoices(apiFilters);
        setInvoices(invoiceData);
        setError(null);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err.message || 'Failed to load invoices');
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      getInvoices();
    }
  }, [isAuthenticated, filters, searchTerm]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle date range changes
  const handleDateRangeChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      customer: '',
      dateRange: { start: '', end: '' }
    });
    setSearchTerm('');
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle invoice deletion
  const handleDeleteInvoice = async (invoice) => {
    setDeleteConfirmation(invoice);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    
    setDeleteLoading(true);
    try {
      await deleteInvoice(deleteConfirmation.Id);
      setInvoices(invoices.filter(inv => inv.Id !== deleteConfirmation.Id));
      setDeleteConfirmation(null);
    } catch (err) {
      console.error('Error deleting invoice:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Sort and filter invoices
  const filteredInvoices = invoices
    .filter(invoice => 
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.issueDate) - new Date(b.issueDate);
        case 'date-desc':
          return new Date(b.issueDate) - new Date(a.issueDate);
        case 'amount-asc':
          return a.total - b.total;
        case 'amount-desc':
          return b.total - a.total;
        case 'number-asc':
          return a.invoiceNumber.localeCompare(b.invoiceNumber);
        case 'number-desc':
          return b.invoiceNumber.localeCompare(a.invoiceNumber);
        default:
          return new Date(b.issueDate) - new Date(a.issueDate);
      }
    });

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
      default:
        return 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-200';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link to="/invoices/create" className="btn-primary">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Invoice
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <ApperIcon 
            name="Search" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 h-5 w-5" 
          />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          {/* Date range filters */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={e => handleDateRangeChange('start', e.target.value)}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={e => handleDateRangeChange('end', e.target.value)}
              className="input"
            />
          </div>
          
          {/* Sort options */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="input"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="number-asc">Invoice Number (Asc)</option>
              <option value="number-desc">Invoice Number (Desc)</option>
            </select>
          </div>
        </div>
        
        <button onClick={clearFilters} className="btn-outline py-1 px-3 text-sm">
          Clear Filters
        </button>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <ApperIcon name="Loader" className="animate-spin h-10 w-10 text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <ApperIcon name="AlertTriangle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Failed to load invoices</h3>
          <p className="text-surface-600 dark:text-surface-400 mb-4">{error}</p>
          <button onClick={() => setFilters({})} className="btn-primary">Retry</button>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-20">
          <ApperIcon name="FileText" className="h-16 w-16 text-surface-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No invoices found</h3>
          <p className="text-surface-600 dark:text-surface-400 mb-4">Try adjusting your filters or create a new invoice</p>
          <Link to="/invoices/create" className="btn-primary">Create Invoice</Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-surface-800 shadow-card rounded-xl overflow-hidden">
            <thead className="bg-surface-100 dark:bg-surface-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-surface-700 dark:text-surface-300">Invoice #</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-surface-700 dark:text-surface-300">Customer</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-surface-700 dark:text-surface-300">Issue Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-surface-700 dark:text-surface-300">Due Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-surface-700 dark:text-surface-300">Total</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-surface-700 dark:text-surface-300">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-surface-700 dark:text-surface-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {filteredInvoices.map(invoice => (
                <tr key={invoice.Id} className="hover:bg-surface-50 dark:hover:bg-surface-750">
                  <td className="py-3 px-4 text-sm font-medium">
                    <Link to={`/invoices/${invoice.Id}`} className="text-primary hover:underline">
                      {invoice.invoiceNumber || `INV-${invoice.Id}`}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-sm">{invoice.customer || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm">{formatDate(invoice.issueDate)}</td>
                  <td className="py-3 px-4 text-sm">{formatDate(invoice.dueDate)}</td>
                  <td className="py-3 px-4 text-sm font-medium">${(invoice.total || invoice.totalAmount || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex space-x-2">
                      <Link to={`/invoices/${invoice.Id}`} className="p-1 text-surface-600 hover:text-primary" title="View">
                        <ApperIcon name="Eye" className="h-4 w-4" />
                      </Link>
                      <Link to={`/invoices/${invoice.Id}/edit`} className="p-1 text-surface-600 hover:text-primary" title="Edit">
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </Link>
                      <button className="p-1 text-surface-600 hover:text-primary" title="Download PDF">
                        <ApperIcon name="Download" className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-surface-600 hover:text-primary" title="Send Email">
                        <ApperIcon name="Mail" className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteInvoice(invoice)} className="p-1 text-surface-600 hover:text-red-500" title="Delete">
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="text-center mb-4">
              <ApperIcon name="AlertTriangle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Delete Invoice</h3>
              <p className="text-surface-600 dark:text-surface-400 mt-2">
                Are you sure you want to delete invoice {deleteConfirmation.invoiceNumber || `#${deleteConfirmation.Id}`}?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setDeleteConfirmation(null)} 
                className="btn-outline py-2"
                disabled={deleteLoading}
              >Cancel</button>
              <button 
                onClick={confirmDelete} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                disabled={deleteLoading}
              >{deleteLoading ? <ApperIcon name="Loader" className="animate-spin h-4 w-4 mx-auto" /> : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;