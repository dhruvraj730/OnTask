import { motion } from 'framer-motion';

const GradientButton = ({ children, onClick, className = '', type = 'button' }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type={type}
            onClick={onClick}
            className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all ${className}`}
        >
            {children}
        </motion.button>
    );
};

export default GradientButton;
