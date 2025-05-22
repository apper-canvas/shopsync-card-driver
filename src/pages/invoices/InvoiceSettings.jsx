import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApperIcon from '../../components/ApperIcon';
import { AuthContext } from '../../App';

const InvoiceSettings = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    defaultTaxRate: 10,
    defaultPaymentTerms: 30,
    invoicePrefix: 'INV-',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    companyLogo: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    noteToCustomer: 'Thank you for your business!',
    paymentInstructions: 'Please make payment within the due date.',
    emailTemplate: 'Dear {{customer}},\n\nPlease find attached invoice {{invoiceNumber}} due on {{dueDate}}.\n\nTotal Amount: ${{total}}\n\nThank you for your business.',
    reminderEnabled: true,
    reminderDays: 3,
    lateFeeEnabled: false,
    lateFeePercentage: 2.5
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please log in to access invoice settings');
      navigate('/login?redirect=/invoices/settings');
    }
  }, [isAuthenticated, navigate]);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (isAuthenticated) {
      const savedSettings = localStorage.getItem('invoiceSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (err) {
          console.error('Error parsing saved invoice settings:', err);
        }
      }
    }
  }, [isAuthenticated]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle numeric input changes
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    setSettings(prev => ({
      ...prev,
      [name]: numericValue
    }));
  };

  // Save settings to localStorage
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      localStorage.setItem('invoiceSettings', JSON.stringify(settings));
      toast.success('Invoice settings saved successfully');
    } catch (err) {
      console.error('Error saving invoice settings:', err);
      toast.error('Failed to save invoice settings');
    } finally {
      setLoading(false);
    }
  };

  // Reset settings to defaults
  const handleReset = () => {
    const confirmed = window.confirm('Are you sure you want to reset all settings to default values?');
    if (confirmed) {
      setSettings({
        defaultTaxRate: 10,
        defaultPaymentTerms: 30,
        invoicePrefix: 'INV-',
        companyName: '',
        companyAddress: '',
        companyPhone: '',
        companyEmail: '',
        companyWebsite: '',
        companyLogo: '',
        bankName: '',
        bankAccountName: '',
        bankAccountNumber: '',
        bankRoutingNumber: '',
        noteToCustomer: 'Thank you for your business!',
        paymentInstructions: 'Please make payment within the due date.',
        emailTemplate: 'Dear {{customer}},\n\nPlease find attached invoice {{invoiceNumber}} due on {{dueDate}}.\n\nTotal Amount: ${{total}}\n\nThank you for your business.',
        reminderEnabled: true,
        reminderDays: 3,
        lateFeeEnabled: false,
        lateFeePercentage: 2.5
      });
      localStorage.removeItem('invoiceSettings');
      toast.info('Settings reset to defaults');
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
        {/* General Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-surface-200 dark:border-surface-700">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                name="defaultTaxRate"
                value={settings.defaultTaxRate}
                onChange={handleNumericChange}
                min="0"
                step="0.01"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Default Payment Terms (days)
              </label>
              <input
                type="number"
                name="defaultPaymentTerms"
                value={settings.defaultPaymentTerms}
                onChange={handleNumericChange}
                min="0"
                step="1"
                className="input"
              />
            </div>
            <div>
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
          </div>
        </div>
        
        {/* Company Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-surface-200 dark:border-surface-700">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
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
            <div className="md:col-span-2">
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
          </div>
        </div>
        
        {/* Payment Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-surface-200 dark:border-surface-700">Payment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={settings.bankName}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Account Name
              </label>
              <input
                type="text"
                name="bankAccountName"
                value={settings.bankAccountName}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>
        
        {/* Email Template */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-surface-200 dark:border-surface-700">Email Template</h2>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Default Email Template
            </label>
            <p className="text-sm text-surface-500 mb-2">
              You can use these placeholders: {{'{{'}}customer{{'}}'}}, {{'{{'}}invoiceNumber{{'}}'}}, {{'{{'}}dueDate{{'}}'}}, {{'{{'}}total{{'}}'}}
            </p>
            <textarea
              name="emailTemplate"
              value={settings.emailTemplate}
              onChange={handleChange}
              className="input"
              rows={6}
            />
          </div>
        </div>
        
        {/* Late Payments */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-surface-200 dark:border-surface-700">Late Payments</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reminderEnabled"
                name="reminderEnabled"
                checked={settings.reminderEnabled}
                onChange={handleChange}
                className="h-4 w-4 text-primary border-surface-300 rounded focus:ring-primary"
              />
              <label htmlFor="reminderEnabled" className="ml-2 block text-sm text-surface-700 dark:text-surface-300">
                Send payment reminders
              </label>
            </div>
            
            {settings.reminderEnabled && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Days before due date
                </label>
                <input
                  type="number"
                  name="reminderDays"
                  value={settings.reminderDays}
                  onChange={handleNumericChange}
                  min="1"
                  step="1"
                  className="input w-24"
                />
              </div>
            )}
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="lateFeeEnabled"
                name="lateFeeEnabled"
                checked={settings.lateFeeEnabled}
                onChange={handleChange}
                className="h-4 w-4 text-primary border-surface-300 rounded focus:ring-primary"
              />
              <label htmlFor="lateFeeEnabled" className="ml-2 block text-sm text-surface-700 dark:text-surface-300">
                Apply late payment fee
              </label>
            </div>
            
            {settings.lateFeeEnabled && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Late fee percentage (%)
                </label>
                <input
                  type="number"
                  name="lateFeePercentage"
                  value={settings.lateFeePercentage}
                  onChange={handleNumericChange}
                  min="0"
                  step="0.1"
                  className="input w-24"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleReset}
            className="btn-outline py-2"
          >
            Reset to Defaults
          </button>
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