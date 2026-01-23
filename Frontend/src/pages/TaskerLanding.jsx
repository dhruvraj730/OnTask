import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedCard from '../components/premium/AnimatedCard';
import GradientButton from '../components/premium/GradientButton';

const TaskerLanding = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gray-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/20 z-0"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
                    >
                        Work <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Your Way</span>
                    </motion.h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        Join the elite network of freelancers. Pick shifts that fit your schedule, get paid instantly, and grow your career.
                    </p>
                    <Link to="/signup?role=job_seeker">
                        <GradientButton>Join as Tasker</GradientButton>
                    </Link>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <AnimatedCard delay={0.1}>
                        <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Instant Matches</h3>
                        <p className="text-gray-600">Get notified about shifts that match your skills and location immediately.</p>
                    </AnimatedCard>
                    <AnimatedCard delay={0.2}>
                        <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">💰</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
                        <p className="text-gray-600">Guaranteed payment for every hour you work. No chasing invoices.</p>
                    </AnimatedCard>
                    <AnimatedCard delay={0.3}>
                        <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">⭐</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Build Reputation</h3>
                        <p className="text-gray-600">Earn badges and reviews to unlock higher-paying premium gigs.</p>
                    </AnimatedCard>
                </div>
            </div>
        </div>
    );
};

export default TaskerLanding;
