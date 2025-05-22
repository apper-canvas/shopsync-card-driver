import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from './ApperIcon';

// Sample product data
const initialProducts = [
  {
    id: 1,
    name: 'Wireless Noise-Cancelling Headphones',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuN',
    category: 'Electronics',
    rating: 4.8,
    stock: 15
  },
  {
    id: 2,
    name: 'Slim Fit Cotton T-Shirt',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuN',
    category: 'Clothing',
    rating: 4.5,
    stock: 50
  },
  {
    id: 3,
    name: 'Smart Fitness Watch',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuN',
    category: 'Electronics',
    rating: 4.7,
    stock: 20
  },
  {
    id: 4,
    name: 'Organic Coconut Oil',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1544467168-9cf334a9ce4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuN',
    category: 'Beauty',
    rating: 4.6,
    stock: 35
  },
  {
    id: 5,
    name: 'Ergonomic Office Chair',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1596079890744-c1a0462d0975?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuN',
    category: 'Furniture',
    rating: 4.9,
    stock: 10
  },
  {
    id: 6,
    name: 'Stainless Steel Water Bottle',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuN',
    category: 'Home',
    rating: 4.4,
    stock: 40
  }
];

const MainFeature = () => {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Get unique categories from products
  const categories = ['All', ...new Set(products.map(product => product.category))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      (selectedCategory === 'All' || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
      if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
      return 0; // Default is featured (original order)
    });

  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  // Add to cart function
  const addToCart = (product) => {
    setCart(prevCart => {
      // Check if product already exists in cart
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Increase quantity if already in cart
        toast.success(`Increased ${product.name} quantity`);
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item to cart
        toast.success(`Added ${product.name} to cart`);
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Remove from cart function
  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const product = prevCart.find(item => item.id === productId);
      toast.info(`Removed ${product.name} from cart`);
      return prevCart.filter(item => item.id !== productId);
    });
  };

  // Update cart item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  // Checkout function
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    toast.success("Thank you for your order!");
    setCart([]);
    setCartOpen(false);
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
              >
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
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card group"
          >
            {/* Product Image */}
            <div className="aspect-square overflow-hidden relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg mb-1 line-clamp-2">{product.name}</h3>
                <div className="flex items-center text-sm text-yellow-500">
                  <ApperIcon name="Star" className="h-4 w-4 mr-1 fill-current" />
                  <span>{product.rating}</span>
                </div>
              </div>
              
              <div className="mb-3 text-surface-500 text-sm">{product.category}</div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="btn-primary p-2 rounded-full"
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
      >
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
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ApperIcon name="ShoppingCart" className="mx-auto h-12 w-12 text-surface-400" />
                  <p className="mt-4 text-surface-500">Your cart is empty</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.map(item => (
                    <li key={item.id} className="flex border-b border-surface-200 dark:border-surface-800 pb-4">
                      {/* Product image */}
                      <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      
                      {/* Product details */}
                      <div className="ml-4 flex-grow">
                        <h4 className="font-medium line-clamp-1">{item.name}</h4>
                        <div className="text-surface-500 text-sm">${item.price.toFixed(2)}</div>
                        
                        {/* Quantity controls */}
                        <div className="mt-2 flex items-center">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 flex items-center justify-center rounded-full border border-surface-300 dark:border-surface-700"
                            aria-label="Decrease quantity"
                          >
                            <ApperIcon name="Minus" className="h-3 w-3" />
                          </button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 flex items-center justify-center rounded-full border border-surface-300 dark:border-surface-700"
                            aria-label="Increase quantity"
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
                </ul>
              )}
            </div>
            
            {/* Cart footer */}
            <div className="border-t border-surface-200 dark:border-surface-700 p-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Checkout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default MainFeature;