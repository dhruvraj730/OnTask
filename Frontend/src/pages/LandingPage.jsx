import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row relative bg-gray-900 overflow-hidden">

            {/* Left: Tasker Section */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2 flex flex-col justify-center items-center p-12 relative z-10 border-b md:border-b-0 md:border-r border-gray-800"
            >
                <div className="absolute inset-0 bg-blue-900/20 z-0"></div>
                <div className="z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-6">
                        I am a Freelancer
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-md">
                        Find flexible shifts, get paid instantly, and build your career on your own terms.
                    </p>
                    <Link to="/tasker">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-blue-600 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-blue-500/50 transition-shadow"
                        >
                            Find Work
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

            {/* Right: Organizer Section */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2 flex flex-col justify-center items-center p-12 relative z-10"
            >
                <div className="absolute inset-0 bg-indigo-900/20 z-0"></div>
                <div className="z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 mb-6">
                        I am an Organizer
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-md">
                        Hire reliable, verified staff for your events in minutes. Simplify your staffing.
                    </p>
                    <Link to="/organizer">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-indigo-600 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-indigo-500/50 transition-shadow"
                        >
                            Hire Talent
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

        </div>
    );
};

export default LandingPage;
