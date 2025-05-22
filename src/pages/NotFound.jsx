import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '../components/ApperIcon';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-xl"
      >
        <div className="relative mx-auto mb-8">
          <ApperIcon name="ShoppingBag" className="h-24 w-24 text-surface-300 mx-auto" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute top-0 right-0 bg-red-500 text-white h-10 w-10 rounded-full flex items-center justify-center"
          >
            <ApperIcon name="X" className="h-6 w-6" />
          </motion.div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          Page Not Found
        </h2>
        
        <p className="text-surface-600 dark:text-surface-400 mb-8 text-lg">
          Oops! The page you're looking for seems to have wandered off our shelves.
        </p>
        
        <Link
          to="/"
          className="btn-primary inline-flex items-center px-6 py-3 text-lg"
        >
          <ApperIcon name="Home" className="mr-2 h-5 w-5" />
          Return to Homepage
        </Link>
        
        <div className="mt-12">
          <p className="text-surface-500 text-sm">
            Looking for something specific? Try our search or check out our featured products.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;