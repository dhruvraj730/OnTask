import { motion } from 'framer-motion';

const GlassContainer = ({ children, className = '' }) => {
    return (
        <div className={`bg-white/70 backdrop-blur-lg border border-white/50 shadow-xl rounded-3xl overflow-hidden ${className}`}>
            {children}
        </div>
    );
};

export default GlassContainer;
