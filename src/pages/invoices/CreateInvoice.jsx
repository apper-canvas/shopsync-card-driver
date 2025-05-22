import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '../../components/ApperIcon';
import { AuthContext } from '../../App';
import { createInvoice } from '../../services/invoiceService';
import { createInvoiceItems } from '../../services/invoiceItemService';
import { fetchProducts } from '../../services/productService';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    customer: '',
    customerEmail: '',
    customerAddress: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
    status: 'draft',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [newItem, setNewItem] = useState({
    product: '',
    description: '',
    quantity: 1,
    unitPrice: 0
  });
  const [taxRate, setTaxRate] = useState(10); // 10% default tax rate

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please log in to create invoices');
      navigate('/login?redirect=/invoices/create');
    }
  }, [isAuthenticated, navigate]);

  // Fetch products for product dropdown
  useEffect(() => {
    const getProducts = async () => {
      if (!isAuthenticated) return;
      
      setProductsLoading(true);
      try {
        const productData = await fetchProducts();
        setProducts(productData);
      } catch (err) {
        console.error('Error fetching products:', err);
        toast.error('Failed to load products');
      } finally {
        setProductsLoading(false);
      }
    };
    
    getProducts();
  }, [isAuthenticated]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle new item field changes
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'product' && value) {
      // If product selected, populate description and price
      const selectedProduct = products.find(p => p.Id.toString() === value);
      if (selectedProduct) {
        setNewItem(prev => ({
          ...prev,
          product: value,
          description: selectedProduct.Name,
          unitPrice: selectedProduct.price || 0
        }));
        return;
      }
    }
    
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value
    }));
  };

  // Add item to invoice
  const addItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast.error('Please fill in all item details with valid values');
      return;
    }
    
    const updatedItems = [
      ...formData.items,
      {
        ...newItem,
        id: Date.now() // Temporary ID for UI purposes
      }
    ];
    
    // Calculate new subtotal
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax;
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      tax,
      total
    }));
    
    // Reset new item form
    setNewItem({
      product: '',
      description: '',
      quantity: 1,
      unitPrice: 0
    });
  };

  // Remove item from invoice
  const removeItem = (itemId) => {
    const updatedItems = formData.items.filter(item => item.id !== itemId);
    
    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax;
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      tax,
      total
    }));
  };

  // Handle tax rate change
  const handleTaxRateChange = (e) => {
    const newTaxRate = parseFloat(e.target.value) || 0;
    setTaxRate(newTaxRate);
    
    // Update tax and total
    const tax = (formData.subtotal * newTaxRate) / 100;
    const total = formData.subtotal + tax;
    
    setFormData(prev => ({
      ...prev,
      tax,
      total
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast.error('Please add at least one item to the invoice');
      return;
    }
    
    if (!formData.customer) {
      toast.error('Please enter customer information');
      return;
    }
    
    setLoading(true);
    try {
      // Prepare data for API
      const invoiceData = {
        Name: `Invoice for ${formData.customer}`,
        invoiceNumber: formData.invoiceNumber,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        customer: formData.customer,
        customerEmail: formData.customerEmail,
        customerAddress: formData.customerAddress,
        status: formData.status,
        notes: formData.notes,
        subtotal: formData.subtotal,
        tax: formData.tax,
        total: formData.total,
        Owner: user?.userId || undefined,
        items: JSON.stringify(formData.items)
      };
      
      const createdInvoice = await createInvoice(invoiceData);
      
      // Create invoice items in the database
      if (formData.items.length > 0) {
        try {
          await createInvoiceItems(createdInvoice.Id, formData.items);
        } catch (itemError) {
          console.error('Error creating invoice items:', itemError);
          // We'll continue even if item creation fails, since the invoice is created
          toast.warning('Invoice created, but there was an issue with invoice items');
        }
      }
      
      toast.success('Invoice created successfully');
      navigate(`/invoices/${createdInvoice.Id}`);
    } catch (err) {
      console.error('Error creating invoice:', err);
      toast.error(err.message || 'Failed to create invoice');
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
            Back
          </Link>
          <h1 className="text-2xl font-bold">Create Invoice</h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-800 shadow-card rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Invoice Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Invoice Information</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Customer Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Customer Email
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                className="input"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Customer Address
              </label>
              <textarea
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                className="input"
                rows={3}
              />
            </div>
          </div>
        </div>
        
        {/* Invoice Items */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Invoice Items</h2>
          
          {/* Add Item Form */}
          <div className="bg-surface-50 dark:bg-surface-750 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Product
                </label>
                <select
                  name="product"
                  value={newItem.product}
                  onChange={handleItemChange}
                  className="input"
                  disabled={productsLoading}
                >
                  <option value="">Select a product (optional)</option>
                  {productsLoading ? (
                    <option>Loading products...</option>
                  ) : (
                    products.map(product => (
                      <option key={product.Id} value={product.Id}>
                        {product.Name} (${product.price?.toFixed(2)})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={newItem.description}
                  onChange={handleItemChange}
                  className="input"
                  placeholder="Item description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={newItem.quantity}
                  onChange={handleItemChange}
                  min="1"
                  step="1"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Unit Price
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={newItem.unitPrice}
                  onChange={handleItemChange}
                  min="0.01"
                  step="0.01"
                  className="input"
                />
              </div>
              <div className="md:col-span-5 flex justify-end mt-2">
                <button
                  type="button"
                  onClick={addItem}
                  className="btn-primary py-2"
                >
                  <ApperIcon name="Plus" className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-100 dark:bg-surface-700 text-left">
                <tr>
                  <th className="py-2 px-4 text-sm font-medium text-surface-700 dark:text-surface-300">Description</th>
                  <th className="py-2 px-4 text-sm font-medium text-surface-700 dark:text-surface-300">Quantity</th>
                  <th className="py-2 px-4 text-sm font-medium text-surface-700 dark:text-surface-300">Unit Price</th>
                  <th className="py-2 px-4 text-sm font-medium text-surface-700 dark:text-surface-300 text-right">Amount</th>
                  <th className="py-2 px-4 text-sm font-medium text-surface-700 dark:text-surface-300 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {formData.items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 px-4 text-center text-surface-500">
                      No items added yet. Use the form above to add items.
                    </td>
                  </tr>
                ) : (
                  formData.items.map(item => (
                    <tr key={item.id}>
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">${Number(item.unitPrice).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">${Number(item.quantity * item.unitPrice).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove item"
                        >
                          <ApperIcon name="Trash2" className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Totals */}
        <div className="mb-6 flex justify-end">
          <div className="w-full md:w-1/3">
            <div className="flex justify-between py-2">
              <span className="font-medium">Subtotal:</span>
              <span>${formData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <span className="font-medium mr-2">Tax Rate:</span>
                <input
                  type="number"
                  value={taxRate}
                  onChange={handleTaxRateChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="input w-16 py-1"
                />
                <span className="ml-1">%</span>
              </div>
              <span>${formData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-surface-200 dark:border-surface-700 font-bold">
              <span>Total:</span>
              <span>${formData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input"
            rows={3}
            placeholder="Additional notes or payment instructions..."
          />
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
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
            <span className={loading ? 'opacity-0' : ''}>Create Invoice</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;