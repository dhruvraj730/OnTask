import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import GlassContainer from '../components/premium/GlassContainer';
import AnimatedCard from '../components/premium/AnimatedCard';

import { Search, MapPin, BadgeIndianRupee, Filter, Briefcase, Zap, Star, Award, TrendingUp } from 'lucide-react';

const TaskerSearch = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        title: '',
        location: '',
        minSalary: '',
        sortBy: 'newest'
    });

    const searchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const res = await axios.get(`/api/search/jobs?${params}`);
            setJobs(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        searchJobs();
    }, [filters.sortBy]); // Re-search when sort changes

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const formatSalary = (job) => {
        if (job.budget) return `₹${job.budget.toLocaleString()}`;
        if (!job.salary) return 'Negotiable';
        return `₹${job.salary.toString().replaceAll('$', '')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Premium Header - Seeker Side (Blue/Emerald) */}
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 pt-32 pb-48 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                </div>
                
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight"
                    >
                        Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Great Gig</span> Starts Here
                    </motion.h1>
                    <p className="text-blue-100 text-xl max-w-2xl mx-auto font-medium opacity-90 mb-12">
                        Browse thousands of high-paying opportunities and join the elite community of taskers.
                    </p>

                    {/* Filter Container */}
                    <GlassContainer className="max-w-6xl mx-auto p-4 md:p-6 shadow-2xl border-white/10 bg-white/95 backdrop-blur-xl">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                <input
                                    name="title"
                                    placeholder="Job Title (e.g. Waiter)"
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all shadow-sm"
                                />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                <input
                                    name="location"
                                    placeholder="Location (e.g. Goa)"
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all shadow-sm"
                                />
                            </div>
                            <div className="relative">
                                <BadgeIndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                <input
                                    name="minSalary"
                                    type="number"
                                    placeholder="Min Pay"
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all shadow-sm"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                <select 
                                    name="sortBy" 
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all appearance-none cursor-pointer shadow-sm"
                                    value={filters.sortBy}
                                >
                                    <option value="newest">Sort: Newest First</option>
                                    <option value="salary">Sort: Highest Pay</option>
                                </select>
                            </div>
                            <button
                                onClick={searchJobs}
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Searching...' : 'Search Jobs'}
                            </button>
                        </div>
                    </GlassContainer>
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map((job) => (
                        <AnimatedCard key={job._id} className="relative group bg-white border border-gray-100 shadow-xl p-8 rounded-[2rem] flex flex-col hover:border-blue-200 transition-all">
                            {/* Status Badge */}
                            {((job.positionsRequired || 1) - (job.hires?.length || 0) > 2) && (
                                <div className="absolute top-6 right-6 flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic shadow-sm">
                                    <TrendingUp className="w-3 h-3" /> Hot Opportunity
                                </div>
                            )}

                            <div className="flex flex-col mb-6">
                                <h3 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">{job.title}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-blue-600 font-bold text-sm tracking-wide">{job.employer?.company || job.employer?.name || "Premium Client"}</p>
                                    {job.employer?.rating >= 4.5 && <Award className="w-4 h-4 text-yellow-500" />}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">Budget</p>
                                    <p className="text-gray-900 font-black text-sm">{formatSalary(job)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">Location</p>
                                    <p className="text-gray-900 font-bold text-sm truncate">{job.location || "Remote"}</p>
                                </div>
                            </div>

                            <div className="mb-6 flex-1">
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {job.description || "Exciting opportunity to work with a leading team on impact projects."}
                                </p>
                                
                                {((job.positionsRequired || 1) - (job.hires?.length || 0) > 0) && (
                                    <div className="flex items-center gap-2 text-[11px] font-black text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-lg uppercase tracking-wider">
                                        <Zap className="w-3 h-3 fill-current" />
                                        {Math.max(0, (job.positionsRequired || 1) - (job.hires?.length || 0))} Position(s) Left
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-50">
                                {user?.role === 'job_seeker' ? (
                                    <Link to={`/project/${job._id}`} className="block">
                                        <button className="w-full py-4 bg-gray-900 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 group-hover:bg-blue-600">
                                            View & Apply
                                        </button>
                                    </Link>
                                ) : !user ? (
                                    <Link to="/login" className="block">
                                        <button className="w-full py-4 bg-gray-50 text-gray-400 font-black text-sm uppercase tracking-widest rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:text-blue-500 transition-all">
                                            Login to Apply
                                        </button>
                                    </Link>
                                ) : (
                                    <div className="w-full py-3 bg-gray-50 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest rounded-xl">
                                        Job Seekers Only
                                    </div>
                                )}
                            </div>
                        </AnimatedCard>
                    ))}
                </div>

                {jobs.length === 0 && !loading && (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">No Jobs Found</h2>
                        <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskerSearch;
