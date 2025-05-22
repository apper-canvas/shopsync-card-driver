import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApperIcon from '../../components/ApperIcon';
import { AuthContext } from '../../App';

const InvoiceSettings = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    companyName: 'ShopSync',
    companyAddress: '123 Commerce Street, New York, NY 10001',
    companyEmail: 'contact@shopsync.com',
    companyPhone: '(555) 123-4567',
    companyLogo: '',
    invoicePrefix: 'INV-',
    defaultTaxRate: 10,
    defaultDueDays: 30,
    defaultNotes: 'Thank you for your business!',
    paymentInstructions: 'Please make payment to the following account:\nBank: Commerce Bank\nAccount: 1234567890'
  });
  const [loading, setLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please log in to access invoice settings');
      navigate('/login?redirect=/invoices/settings');
    }
  }, [isAuthenticated, navigate]);

  // Load settings from localStorage (in a real app, these would come from the database)
  useEffect(() => {
    const savedSettings = localStorage.getItem('invoiceSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, this would be saved to the database via a service
      localStorage.setItem('invoiceSettings', JSON.stringify(settings));
      toast.success('Invoice settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Link to="/invoices" className="btn-outline py-2">
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-1" />
            Back to Invoices
          </Link>
          <h1 className="text-2xl font-bold">Invoice Settings</h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-800 shadow-card rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Company Information</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Company Address
              </label>
              <textarea
                name="companyAddress"
                value={settings.companyAddress}
                onChange={handleChange}
                className="input"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Company Email
              </label>
              <input
                type="email"
                name="companyEmail"
                value={settings.companyEmail}
                onChange={handleChange}
                className="input"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Company Phone
              </label>
              <input
                type="text"
                name="companyPhone"
                value={settings.companyPhone}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
          
          {/* Invoice Defaults */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Invoice Defaults</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                name="invoicePrefix"
                value={settings.invoicePrefix}
                onChange={handleChange}
                className="input"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                name="defaultTaxRate"
                value={settings.defaultTaxRate}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="input"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Default Payment Terms (days)
              </label>
              <input
                type="number"
                name="defaultDueDays"
                value={settings.defaultDueDays}
                onChange={handleChange}
                min="1"
                step="1"
                className="input"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Default Notes
              </label>
              <textarea
                name="defaultNotes"
                value={settings.defaultNotes}
                onChange={handleChange}
                className="input"
                rows={2}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Payment Instructions
              </label>
              <textarea
                name="paymentInstructions"
                value={settings.paymentInstructions}
                onChange={handleChange}
                className="input"
                rows={3}
              />
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <Link to="/invoices" className="btn-outline py-2">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary py-2 relative"
            disabled={loading}
          >
            {loading && (
              <ApperIcon name="Loader" className="animate-spin h-4 w-4 mr-1 absolute left-1/2 -translate-x-1/2" />
            )}
            <span className={loading ? 'opacity-0' : ''}>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceSettings;