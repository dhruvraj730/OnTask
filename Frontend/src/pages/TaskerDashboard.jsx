import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Search, Briefcase, IndianRupee, User, Sparkles, ArrowRight, Zap, MapPin, Clock } from 'lucide-react';
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

    const [aiQuery, setAiQuery] = useState('');
    const [aiResults, setAiResults] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSearched, setAiSearched] = useState(false);

    const handleAiSearch = async (e) => {
        e.preventDefault();
        if (!aiQuery.trim()) return;

        setAiLoading(true);
        setAiSearched(true);
        try {
            // Using existing search API with title filter as a proxy for "AI" match
            // In a real AI implementation, this would send the full natural language query
            const res = await axios.get(`/api/search/jobs?title=${aiQuery}`);
            setAiResults(res.data);
        } catch (error) {
            console.error("AI Search failed:", error);
        } finally {
            setAiLoading(false);
        }
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
                                <h3 className="text-3xl font-bold">Limitless</h3>
                                <p className="text-emerald-100 text-sm">Opportunities Await</p>
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

                    <form onSubmit={handleAiSearch} className="relative">
                        <input
                            type="text"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            placeholder="Tell me what you're looking for (e.g., 'React', 'Logo Design')..."
                            className="w-full pl-6 pr-14 py-4 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        />
                        <button type="submit" className="absolute right-2 top-2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                            {aiLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Zap className="w-5 h-5" />}
                        </button>
                    </form>

                    {/* AI Results */}
                    {aiSearched && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">AI Recommendations</h3>

                            {aiResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {aiResults.map(job => (
                                        <Link key={job._id} to={`/project/${job._id}`} className="block group">
                                            <div className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all bg-purple-50/30">
                                                <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{job.title}</h4>
                                                <p className="text-sm text-gray-500 mt-1">{job.company} • {job.location}</p>
                                                <div className="mt-3 flex items-center justify-between">
                                                    <span className="text-xs font-bold px-2 py-1 bg-white rounded-md text-gray-600 border border-gray-100">{job.salary?.includes('$') ? job.salary.replaceAll('$', '₹') : (job.salary?.includes('₹') ? job.salary : (job.salary ? `₹${job.salary}` : 'N/A'))}</span>
                                                    <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500">No AI matches found for "{aiQuery}". Try broader keywords.</p>
                                </div>
                            )}
                        </div>
                    )}
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
                                <div
                                    key={job._id}
                                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {job.startDate ? new Date(job.startDate).toLocaleDateString() : 'Immediate'}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3" /> {job.duration ? `${job.duration.value} ${job.duration.unit}` : 'Flexible'}
                                                </span>
                                                {/* Skill Tags */}
                                                {job.skills && job.skills.length > 0 ? (
                                                    job.skills.map(skill => (
                                                        <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md">{skill}</span>
                                                    ))
                                                ) : (
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {job.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <div className="flex items-center gap-2 justify-start sm:justify-end mb-1">
                                                {job.endDate && (
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">
                                                        Due {new Date(job.endDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {(job.positionsRequired || 1) - (job.hires?.length || 0) > 0 && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                                                        🔥 {Math.max(0, (job.positionsRequired || 1) - (job.hires?.length || 0))} Spots Left
                                                    </span>
                                                )}
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                    <Zap className="w-3 h-3" /> Urgent
                                                </span>
                                            </div>
                                            <p className="text-xl font-extrabold text-gray-900">{job.salary?.includes('$') ? job.salary.replaceAll('$', '₹') : (job.salary?.includes('₹') ? job.salary : (job.salary ? `₹${job.salary}` : 'Commensurate'))}</p>
                                            <div className="mb-4 space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tight">
                                                        <span>Verified Progress</span>
                                                        <span className="text-emerald-600">{job.progress || 0}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
                                                            style={{ width: `${job.progress || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-widest font-mono">
                                                        <span>Schedule</span>
                                                        <span className="text-blue-500">{job.timeBasedProgress || 0}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1 shadow-inner overflow-hidden">
                                                        <div
                                                            className="bg-blue-400 h-1 rounded-full"
                                                            style={{ width: `${job.timeBasedProgress || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                                        <Link to={`/project/${job._id}`} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                                            View Details <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
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
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <IndianRupee className="w-6 h-6" />
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
