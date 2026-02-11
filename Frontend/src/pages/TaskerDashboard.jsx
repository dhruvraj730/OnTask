import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Search, Briefcase, DollarSign, User, Sparkles, ArrowRight, Zap, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import AIChatbot from '../components/AIChatbot';

const TaskerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'job_seeker') {
            navigate(user.role === 'employer' ? '/pro/dashboard' : '/');
            return;
        }

        const fetchJobs = async () => {
            try {
                // Fetch random jobs for the "Matching Jobs" section
                // In a real app, this would be personalized based on user skills
                const res = await axios.get('/api/search/jobs');
                setJobs(res.data.slice(0, 3)); // Show top 3 matching jobs
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [user, navigate]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Hero Section */}
            <div className="bg-white px-4 pt-8 pb-12 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 sm:p-16 items-center">
                        <div className="text-white space-y-6">
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                                Your Talent. <br />
                                Your Future.
                            </h1>
                            <p className="text-lg text-emerald-50 max-w-lg">
                                Access high-paying projects, build your portfolio, and grow your freelance career with OnTask.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link to="/find-jobs" className="px-8 py-3 bg-white text-emerald-600 font-bold rounded-full shadow-lg hover:bg-emerald-50 transition-colors flex items-center gap-2">
                                    Explore Jobs <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/pricing" className="px-8 py-3 bg-emerald-700/50 backdrop-blur-sm text-white font-bold rounded-full border border-emerald-400/30 hover:bg-emerald-700/70 transition-colors">
                                    View Plans
                                </Link>
                            </div>
                        </div>

                        {/* Floating Card Visual */}
                        <div className="hidden lg:flex justify-center items-center">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-xl flex flex-col items-center text-white w-64 text-center transform rotate-3 hover:rotate-0 transition-transform duration-500"
                            >
                                <div className="bg-orange-500 p-4 rounded-full mb-4 shadow-lg">
                                    <Briefcase className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-3xl font-bold">50,000+</h3>
                                <p className="text-emerald-100 text-sm">Active Projects</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-12">

                {/* AI Job Finder */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">AI Job Finder</h2>
                    </div>

                    <p className="text-gray-500 text-sm mb-6">Describe your ideal project and let AI help you find the perfect job match.</p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
                        {/* Chat Bubble Mockup */}
                        <div className="flex justify-end mb-4">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm font-medium shadow-sm">
                                Budget Range ₹500
                            </div>
                        </div>
                        <div className="flex justify-start mb-2">
                            <div className="bg-white text-gray-700 px-4 py-2 rounded-2xl rounded-tl-sm text-sm font-medium shadow-sm border border-gray-200">
                                Great! I found projects within your budget range. Here are the best matches for you.
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tell me what you're looking for..."
                            className="w-full pl-6 pr-14 py-4 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        />
                        <button className="absolute right-2 top-2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                            <Zap className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>

                {/* Matching Jobs */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        Matching Jobs <span className="text-sm font-normal text-gray-500">({jobs.length})</span>
                    </h2>

                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-gray-500">Loading jobs...</p>
                        ) : jobs.length > 0 ? (
                            jobs.map((job) => (
                                <motion.div
                                    key={job._id}
                                    variants={itemVariants}
                                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {/* Tech Stack Tags Mockup */}
                                                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md">React</span>
                                                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-md">Node.js</span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {job.location}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <div className="flex items-center gap-2 justify-start sm:justify-end mb-1">
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                    <Zap className="w-3 h-3" /> Urgent
                                                </span>
                                            </div>
                                            <p className="text-xl font-extrabold text-gray-900">{job.salary?.includes('$') ? job.salary.replace('$', '₹') : job.salary || "Commensurate"}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                                        <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                                            View Details <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                                <p className="text-gray-500">No matching jobs found just yet.</p>
                                <Link to="/find-jobs" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Browse all jobs</Link>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Bottom Stats / Nav */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/applications" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900">My Applications</h3>
                        <p className="text-xs text-gray-500 mt-1">Track your proposals</p>
                    </Link>

                    <Link to="/earnings" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900">Earnings</h3>
                        <p className="text-xs text-gray-500 mt-1">Manage your wallet</p>
                    </Link>

                    <Link to="/profile" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900">My Profile</h3>
                        <p className="text-xs text-gray-500 mt-1">Edit & showcase skills</p>
                    </Link>
                </div>

            </div>
            <AIChatbot />
        </div>
    );
};

export default TaskerDashboard;
