import { motion } from 'framer-motion';

const AnimatedCard = ({ children, className = '', delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay }}
            whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)" }}
            className={`bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg hover:border-blue-300 transition-colors ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedCard;
