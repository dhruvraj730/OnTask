import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedCard from '../components/premium/AnimatedCard';
import GradientButton from '../components/premium/GradientButton';

const OrganizerLanding = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gray-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-indigo-900/20 z-0"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
                    >
                        Staffing <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">Simplified</span>
                    </motion.h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        Access a pool of vetted, reliable staff for your events. From promoters to servers, we have you covered.
                    </p>
                    <Link to="/signup?role=employer">
                        <GradientButton className="!from-purple-600 !to-pink-600 !hover:from-purple-500 !hover:to-pink-500">
                            Hire Talent
                        </GradientButton>
                    </Link>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <AnimatedCard delay={0.1}>
                        <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">👥</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Vetted Staff</h3>
                        <p className="text-gray-600">Every profile is verified. See ratings and bios before you hire.</p>
                    </AnimatedCard>
                    <AnimatedCard delay={0.2}>
                        <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">📅</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Easy Scheduling</h3>
                        <p className="text-gray-600">Post shifts with specific times, venues, and uniform requirements.</p>
                    </AnimatedCard>
                    <AnimatedCard delay={0.3}>
                        <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">🛡️</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">No No-Shows</h3>
                        <p className="text-gray-600">Our reliability score system ensures your staff shows up on time.</p>
                    </AnimatedCard>
                </div>
            </div>
        </div>
    );
};

export default OrganizerLanding;
