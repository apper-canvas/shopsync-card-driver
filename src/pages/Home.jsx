import { useState } from 'react';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ApperIcon from '../components/ApperIcon';
import MainFeature from '../components/MainFeature';
import { AuthContext } from '../App';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white dark:bg-surface-800 shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <ApperIcon name="ShoppingBag" className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold text-surface-900 dark:text-white">ShopSync</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-surface-900 dark:text-white hover:text-primary dark:hover:text-primary-light font-medium">
              Home
            </a>
            <a href="#" className="text-surface-600 dark:text-surface-300 hover:text-primary dark:hover:text-primary-light">
              Shop
            </a>
            <Link to="/invoices" className="text-surface-600 dark:text-surface-300 hover:text-primary dark:hover:text-primary-light">
              Invoices
            </Link>
            <a href="#" className="text-surface-600 dark:text-surface-300 hover:text-primary dark:hover:text-primary-light">
              Categories
            </a>
            <Link to="#" className="text-surface-600 dark:text-surface-300 hover:text-primary dark:hover:text-primary-light">
              About
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-surface-700 dark:text-surface-300">
                  Welcome, {user?.firstName || 'User'}
                </div>
                <button 
                  onClick={logout}
                  aria-label="Logout" 
                  className="p-2 text-surface-600 dark:text-surface-300 hover:text-primary dark:hover:text-primary-light"
                >
                  <ApperIcon name="LogOut" className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-outline">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-surface-600 dark:text-surface-300"
            aria-label="Toggle menu"
          >
            <ApperIcon name={isMenuOpen ? "X" : "Menu"} className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <a href="#" className="py-2 text-surface-900 dark:text-white font-medium">
                Home
              </a>
              <a href="#" className="py-2 text-surface-600 dark:text-surface-300">
                Shop
              </a>
              <Link to="/invoices" className="py-2 text-surface-600 dark:text-surface-300">
                Invoices
              </Link>
              <a href="#" className="py-2 text-surface-600 dark:text-surface-300">
                Categories
              </a>
              <a href="#" className="py-2 text-surface-600 dark:text-surface-300">
                About
              </a>
              <div className="pt-4 border-t border-surface-200 dark:border-surface-700 mt-2">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-4">
                    <div className="text-surface-700 dark:text-surface-300">
                      Welcome, {user?.firstName || 'User'}
                    </div>
                    <button 
                      onClick={logout}
                      className="btn-outline w-full"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link to="/login" className="btn-outline w-full">
                      Login
                    </Link>
                    <Link to="/signup" className="btn-primary w-full">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Discover Amazing Products for Every Need
            </h1>
            <p className="text-lg md:text-xl text-surface-700 dark:text-surface-300 mb-8 max-w-2xl mx-auto">
              Browse our curated collection of high-quality products with fast shipping and exceptional customer service.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="btn-primary py-3 px-8 text-lg">
                Shop Now
              </button>
              <button className="btn-outline py-3 px-8 text-lg">
                View Categories
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Product Browsing Feature */}
      <section className="py-12 flex-grow">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Featured Products</h2>
          <MainFeature />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-surface-100 dark:bg-surface-800 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Why Choose Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Benefit 1 */}
            <div className="card-neu p-6 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                <ApperIcon name="Truck" className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Shipping</h3>
              <p className="text-surface-600 dark:text-surface-400">On all orders over $50</p>
            </div>
            
            {/* Benefit 2 */}
            <div className="card-neu p-6 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary mb-4 mx-auto">
                <ApperIcon name="ShieldCheck" className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-surface-600 dark:text-surface-400">100% secure payment</p>
            </div>
            
            {/* Benefit 3 */}
            <div className="card-neu p-6 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent mb-4 mx-auto">
                <ApperIcon name="RotateCcw" className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
              <p className="text-surface-600 dark:text-surface-400">30 day return policy</p>
            </div>
            
            {/* Benefit 4 */}
            <div className="card-neu p-6 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                <ApperIcon name="Headset" className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-surface-600 dark:text-surface-400">Dedicated customer support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-800 dark:bg-surface-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                  <ApperIcon name="ShoppingBag" className="h-5 w-5" />
                </span>
                <span className="text-xl font-bold">ShopSync</span>
              </div>
              <p className="text-surface-300 mb-4">
                Your one-stop destination for all your shopping needs.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-surface-300 hover:text-white" aria-label="Facebook">
                  <ApperIcon name="Facebook" className="h-5 w-5" />
                </a>
                <a href="#" className="text-surface-300 hover:text-white" aria-label="Twitter">
                  <ApperIcon name="Twitter" className="h-5 w-5" />
                </a>
                <a href="#" className="text-surface-300 hover:text-white" aria-label="Instagram">
                  <ApperIcon name="Instagram" className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-surface-300 hover:text-white">Home</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white">Shop</a></li>
                <li><Link to="/invoices" className="text-surface-300 hover:text-white">Invoices</Link></li>
                <li><a href="#" className="text-surface-300 hover:text-white">Categories</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white">Contact</a></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-surface-300 hover:text-white">My Account</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white">Order Tracking</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white">Wishlist</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white">Returns & Exchanges</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white">FAQs</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-surface-300 mb-4">
                Subscribe to our newsletter for updates on new products and special offers.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 rounded-l-lg bg-surface-700 border border-surface-600 focus:outline-none focus:ring-1 focus:ring-primary flex-grow"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-r-lg"
                >
                  <ApperIcon name="Send" className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-surface-700 mt-12 pt-6 text-center text-surface-400">
            <p>&copy; {new Date().getFullYear()} ShopSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;