import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ApperIcon from './ApperIcon';
import { AuthContext } from '../App';
import { fetchProducts } from '../services/productService';
import { fetchCategories } from '../services/categoryService';
import { getUserCart, createCart, updateCart } from '../services/cartService';
import { addCartItem, updateCartItem, removeCartItem } from '../services/cartItemService';
import { createOrder } from '../services/orderService';
import { createInvoice } from '../services/invoiceService';

const MainFeature = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState({
    products: true,
    categories: true,
    cart: false,
    addToCart: false,
    removeFromCart: false,
    updateQuantity: false,
    generateInvoice: false,
    checkout: false
  });
  const [error, setError] = useState({
    products: null,
    categories: null,
    cart: null,
    addToCart: null,
    removeFromCart: null,
    updateQuantity: null,
    generateInvoice: null,
    checkout: null
  });

  // Fetch products from database
  useEffect(() => {
    const getProducts = async () => {
      setLoading(prev => ({ ...prev, products: true }));
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        setError(prev => ({ ...prev, products: null }));
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(prev => ({ ...prev, products: err.message || 'Failed to load products' }));
        toast.error('Failed to load products');
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };
    
    getProducts();
  }, []);

  // Fetch categories from database
  useEffect(() => {
    const getCategories = async () => {
      setLoading(prev => ({ ...prev, categories: true }));
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(['All', ...fetchedCategories.map(cat => cat.Name)]);
        setError(prev => ({ ...prev, categories: null }));
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(prev => ({ ...prev, categories: err.message || 'Failed to load categories' }));
        // Fall back to extracting categories from products if API fails
        if (products.length > 0) {
          setCategories(['All', ...new Set(products.map(product => 
            product.category?.Name || 'Uncategorized'))]);
        }
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };
    
    getCategories();
  }, [products]);

  // Fetch user's cart if authenticated
  useEffect(() => {
    const getCart = async () => {
      if (!isAuthenticated || !user?.userId) return;

      setLoading(prev => ({ ...prev, cart: true }));
      try {
        const userCart = await getUserCart(user.userId);
        
        if (userCart) {
          // Cart exists, fetch items
          setCartId(userCart.Id);
          
          // The items are fetched along with the cart in getUserCart
          if (userCart.items && Array.isArray(userCart.items)) {
            setCart(userCart.items.map(item => ({
              id: item.product?.Id,
              name: item.product?.Name,
              price: item.price || 0,
              image: item.product?.image,
              quantity: item.quantity || 1,
              cartItemId: item.Id
            })));
          }
        } else {
          // No cart exists, create one
          const newCart = await createCart(user.userId);
          setCartId(newCart.Id);
          setCart([]);
        }
        setError(prev => ({ ...prev, cart: null }));
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError(prev => ({ ...prev, cart: err.message || 'Failed to load cart' }));
      } finally {
        setLoading(prev => ({ ...prev, cart: false }));
      }
    };
    
    getCart();
  }, [isAuthenticated, user]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      (selectedCategory === 'All' || product.category?.Name === selectedCategory) &&
      product.Name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      if (sortBy === 'nameAsc') return a.Name.localeCompare(b.Name);
      if (sortBy === 'nameDesc') return b.Name.localeCompare(a.Name);
      return 0; // Default is featured (original order)
    });

  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  // Add to cart function
  const addToCart = (product) => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      navigate('/login?redirect=/');
      return;
    }

    // Check if cart exists
    if (!cartId) {
      toast.error('Unable to add item: Cart not initialized');
      return;
    }

    setLoading(prev => ({ ...prev, addToCart: true }));
    
    const existingItem = cart.find(item => item.id === product.Id);
    
    if (existingItem) {
      // Update existing cart item
      const newQuantity = existingItem.quantity + 1;
      updateCartItem(existingItem.cartItemId, {
        quantity: newQuantity,
        price: product.price * newQuantity
      })
      .then(() => {
        // Update local cart state
        setCart(prevCart => prevCart.map(item => 
          item.id === product.Id 
            ? { ...item, quantity: newQuantity } 
            : item
        ));
        
        // Update cart total
        updateCart(cartId, {
          total: cartTotal + product.price
        });
        
        toast.success(`Increased ${product.Name} quantity`);
        setError(prev => ({ ...prev, addToCart: null }));
      })
      .catch(err => {
        console.error('Error updating cart item:', err);
        setError(prev => ({ ...prev, addToCart: err.message || 'Failed to update item quantity' }));
        toast.error('Failed to update item quantity');
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, addToCart: false }));
      });
    } else {
      // Add new cart item
      const newCartItem = {
        product: product.Id,
        cart: cartId,
        quantity: 1,
        price: product.price,
        Name: `${product.Name} in cart ${cartId}`
      };
      
      addCartItem(newCartItem)
      .then(addedItem => {
        // Update local cart state
        setCart(prevCart => [...prevCart, {
          id: product.Id,
          name: product.Name,
          price: product.price,
          image: product.image,
          quantity: 1,
          cartItemId: addedItem.Id
        }]);
        
        // Update cart total
        updateCart(cartId, {
          total: cartTotal + product.price
        });
        
        toast.success(`Added ${product.Name} to cart`);
        setError(prev => ({ ...prev, addToCart: null }));
      })
      .catch(err => {
        console.error('Error adding item to cart:', err);
        setError(prev => ({ ...prev, addToCart: err.message || 'Failed to add item to cart' }));
        toast.error('Failed to add item to cart');
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, addToCart: false }));
      });
      }
  };

  // Remove from cart function
  const removeFromCart = (productId) => {
    // Find cart item
    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem) return;
    
    setLoading(prev => ({ ...prev, removeFromCart: true }));
    
    removeCartItem(cartItem.cartItemId)
      .then(() => {
        // Update local cart state
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
        
        // Update cart total
        updateCart(cartId, {
          total: cartTotal - (cartItem.price * cartItem.quantity)
        });
        
        toast.info(`Removed ${cartItem.name} from cart`);
        setError(prev => ({ ...prev, removeFromCart: null }));
      })
      .catch(err => {
        console.error('Error removing item from cart:', err);
        setError(prev => ({ ...prev, removeFromCart: err.message || 'Failed to remove item from cart' }));
        toast.error('Failed to remove item from cart');
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, removeFromCart: false }));
      });
  };

  // Update cart item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    // Find cart item
    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem) return;
    
    setLoading(prev => ({ ...prev, updateQuantity: true }));
    
    // Calculate price difference for cart total update
    const oldTotal = cartItem.price * cartItem.quantity;
    const newTotal = cartItem.price * newQuantity;
    const difference = newTotal - oldTotal;
    
    updateCartItem(cartItem.cartItemId, {
      quantity: newQuantity,
      price: cartItem.price * newQuantity
    })
    .then(() => {
      // Update local cart state
      setCart(prevCart => prevCart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
      
      // Update cart total
      updateCart(cartId, {
        total: cartTotal + difference
      });
      
      setError(prev => ({ ...prev, updateQuantity: null }));
    })
    .catch(err => {
      console.error('Error updating quantity:', err);
      setError(prev => ({ ...prev, updateQuantity: err.message || 'Failed to update quantity' }));
      toast.error('Failed to update quantity');
    })
    .finally(() => {
      setLoading(prev => ({ ...prev, updateQuantity: false }));
    });
  };
  // Generate invoice from cart
  const handleGenerateInvoice = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info('Please log in to generate an invoice');
      navigate('/login?redirect=/');
      return;
    }
    
    setLoading(prev => ({ ...prev, generateInvoice: true }));
    
    try {
      // Create invoice data from cart
      const invoiceData = {
        Name: `Invoice for ${user?.firstName} ${user?.lastName || ''}`,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        customer: `${user?.firstName} ${user?.lastName || ''}`,
        customerEmail: user?.emailAddress || '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        items: JSON.stringify(cart.map(item => ({
          description: item.name,
          quantity: item.quantity,
          unitPrice: item.price
        }))),
        subtotal: cartTotal,
        tax: cartTotal * 0.1, // 10% tax
        total: cartTotal + (cartTotal * 0.1),
        notes: 'Thank you for your business!'
      };
      
      // Create invoice
      const newInvoice = await createInvoice(invoiceData);
      toast.success("Invoice generated successfully!");
      navigate(`/invoices/${newInvoice.Id}`);
    } catch (err) {
      console.error('Error generating invoice:', err);
      toast.error('Failed to generate invoice');
    } finally {
      setLoading(prev => ({ ...prev, generateInvoice: false }));
    }
  };


  // Checkout function
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info('Please log in to checkout');
      navigate('/login?redirect=/');
      return;
    }
    
    setLoading(prev => ({ ...prev, checkout: true }));
    
    // Create order from cart
    const order = {
      user: user.userId,
      total: cartTotal,
      status: 'pending',
      Name: `Order from ${user.firstName} ${user.lastName} on ${new Date().toLocaleDateString()}`
    };
    
    createOrder(order)
      .then(async (newOrder) => {
        // Update cart status to completed
        await updateCart(cartId, {
          status: 'completed'
        });
        
        // Create new empty cart for user
        const newCart = await createCart(user.userId);
        setCartId(newCart.Id);
        setCart([]);
        
        toast.success("Thank you for your order!");
        setCartOpen(false);
        setError(prev => ({ ...prev, checkout: null }));
      })
      .catch(err => {
        console.error('Error during checkout:', err);
        setError(prev => ({ ...prev, checkout: err.message || 'Checkout failed' }));
        toast.error('Checkout failed. Please try again.');
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, checkout: false }));
      });
  };
  
  // Loading states for UI display
  const isProductsLoading = loading.products;
  const isCategoriesLoading = loading.categories;
  const isCartLoading = loading.cart;
  const isGeneratingInvoice = loading.generateInvoice;
  const isCheckoutLoading = loading.checkout;
  
  // Show loading indicator when products are being fetched
  if (isProductsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <ApperIcon name="Loader" className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <ApperIcon 
            name="Search" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 h-5 w-5" 
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                disabled={isCategoriesLoading}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isCategoriesLoading
                    ? 'bg-surface-200 dark:bg-surface-700 opacity-50 cursor-not-allowed'
                    : selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
              >
                {isCategoriesLoading ? <ApperIcon name="Loader" className="animate-spin h-3 w-3 inline mr-1" /> : null}
                {category}
              </button>
            ))}
          </div>
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 py-1.5 px-3 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="nameAsc">Name: A to Z</option>
              <option value="nameDesc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <motion.div
            key={product.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card group"
          >
            {/* Product Image */}
            <div className="aspect-square overflow-hidden relative">
              <img 
                src={product.image} 
                alt={product.Name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg mb-1 line-clamp-2">{product.Name}</h3>
                <div className="flex items-center text-sm text-yellow-500">
                  <ApperIcon name="Star" className="h-4 w-4 mr-1 fill-current" />
                  <span>{product.rating}</span>
                </div>
              </div>
              
              <div className="mb-3 text-surface-500 text-sm">{product.category?.Name || 'Uncategorized'}</div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(product)}
                  className={`btn-primary p-2 rounded-full ${loading.addToCart ? 'opacity-50' : ''}`}
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ApperIcon name="ShoppingCart" className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div className="py-12 text-center">
          <ApperIcon name="PackageSearch" className="mx-auto h-16 w-16 text-surface-400" />
          <h3 className="mt-4 text-xl font-medium">No products found</h3>
          <p className="mt-2 text-surface-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Cart Button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed z-40 bottom-4 left-4 p-3 rounded-full bg-primary text-white shadow-soft hover:bg-primary-dark transition-colors"
        aria-label="Open shopping cart"
        disabled={isCartLoading}
      >
        {isCartLoading && <ApperIcon name="Loader" className="absolute -top-2 -right-2 h-5 w-5 animate-spin" />}
        <div className="relative">
          <ApperIcon name="ShoppingBag" className="h-5 w-5" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-secondary text-white text-xs">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </div>
      </button>

      {/* Cart Sidebar */}
      {cartOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setCartOpen(false)}
          ></div>
          
          {/* Cart panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-surface-900 shadow-xl z-50 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Cart</h2>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800"
                aria-label="Close cart"
              >
                <ApperIcon name="X" className="h-6 w-6" />
              </button>
            </div>
            
            {/* Cart items */}
            <div className="flex-grow overflow-auto p-4">
              {isCartLoading ? (
                <div className="text-center py-12">
                  <ApperIcon name="Loader" className="mx-auto h-12 w-12 text-primary animate-spin" />
                  <p className="mt-4 text-surface-500">Loading your cart...</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-12">
                  <ApperIcon name="ShoppingCart" className="mx-auto h-12 w-12 text-surface-400" />
                  <p className="mt-4 text-surface-500">Your cart is empty</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.map(item => (
                    <li key={item.cartItemId} className="flex border-b border-surface-200 dark:border-surface-800 pb-4">
                      {/* Product image */}
                      <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      
                      {/* Product details */}
                      <div className="ml-4 flex-grow">
                        <h4 className="font-medium line-clamp-1">{item.name}</h4>
                        <div className="text-surface-500 text-sm">${item.price.toFixed(2)}</div>
                        
                        {/* Quantity controls */}
                          disabled={loading.removeFromCart}
                        <div className="mt-2 flex items-center">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 flex items-center justify-center rounded-full border border-surface-300 dark:border-surface-700"
                            aria-label="Decrease quantity"
                            disabled={loading.updateQuantity}
                          >
                            {loading.updateQuantity ? <ApperIcon name="Loader" className="h-3 w-3 animate-spin" /> : <ApperIcon name="Minus" className="h-3 w-3" />}
                          </button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 flex items-center justify-center rounded-full border border-surface-300 dark:border-surface-700"
                            aria-label="Increase quantity"
                            disabled={loading.updateQuantity}
                          >
                            <ApperIcon name="Plus" className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Remove button and price */}
                      <div className="ml-2 flex flex-col justify-between items-end">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-surface-500 hover:text-red-500"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <ApperIcon name="Trash2" className="h-4 w-4" />
                        </button>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </li>
                  ))}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed relative"
              )}
                {isCheckoutLoading && <ApperIcon name="Loader" className="animate-spin h-5 w-5 absolute left-1/2 transform -translate-x-1/2" />}
                <span className={isCheckoutLoading ? 'opacity-0' : ''}>Checkout</span>
            
            {/* Cart footer */}
            <div className="border-t border-surface-200 dark:border-surface-700 p-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleGenerateInvoice}
                disabled={cart.length === 0 || isGeneratingInvoice}
                className="btn-outline w-full py-3 mb-3 disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {isGeneratingInvoice && <ApperIcon name="Loader" className="animate-spin h-5 w-5 absolute left-1/2 transform -translate-x-1/2" />}
                <span className={isGeneratingInvoice ? 'opacity-0' : ''}>Generate Invoice</span>
              </button>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isCheckoutLoading}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {isCheckoutLoading && <ApperIcon name="Loader" className="animate-spin h-5 w-5 absolute left-1/2 transform -translate-x-1/2" />}
                <span className={isCheckoutLoading ? 'opacity-0' : ''}>Checkout</span>
              </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default MainFeature;