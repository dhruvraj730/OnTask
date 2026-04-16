import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import GlassContainer from '../components/premium/GlassContainer';
import AnimatedCard from '../components/premium/AnimatedCard';

import { Search, Star, Clock, Filter, Briefcase, Zap, Award } from 'lucide-react';

const OrganizerTalentSearch = () => {
    const [taskers, setTaskers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        skill: '',
        minRating: '',
        minExperience: '',
        sortBy: 'newest'
    });

    const searchTaskers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const res = await axios.get(`/api/search/taskers?${params}`);
            setTaskers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        searchTaskers();
    }, [filters.sortBy]); // Re-search when sort changes

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 pt-32 pb-48 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                </div>
                
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight"
                    >
                        Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Elite Talent</span>
                    </motion.h1>
                    <p className="text-blue-100 text-xl max-w-2xl mx-auto font-medium opacity-90 mb-12">
                        Connect with verified professionals and experts ready to bring your next project to life.
                    </p>

                    {/* Filter Container */}
                    <GlassContainer className="max-w-6xl mx-auto p-4 md:p-6 shadow-2xl border-white/10 bg-white/90 backdrop-blur-xl">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                <input
                                    name="skill"
                                    placeholder="Skill (e.g. React)"
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all shadow-sm"
                                />
                            </div>
                            <div className="relative">
                                <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                                <input
                                    name="minRating"
                                    type="number"
                                    placeholder="Min Rating"
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all shadow-sm"
                                />
                            </div>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                <input
                                    name="minExperience"
                                    type="number"
                                    placeholder="Min Exp (Yrs)"
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all shadow-sm"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                                <select 
                                    name="sortBy" 
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all appearance-none cursor-pointer shadow-sm"
                                    value={filters.sortBy}
                                >
                                    <option value="newest">Sort: Join Date</option>
                                    <option value="rating">Sort: Highest Rating</option>
                                    <option value="experience">Sort: Experience</option>
                                </select>
                            </div>
                            <button
                                onClick={searchTaskers}
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Searching...' : 'Search Talent'}
                            </button>
                        </div>
                    </GlassContainer>
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {taskers.map((tasker) => (
                        <AnimatedCard key={tasker._id} className="relative group bg-white border border-gray-100 shadow-xl p-8 rounded-[2rem] flex flex-col hover:border-blue-200 transition-all">
                            {/* Verified Badge */}
                            {(tasker.rating >= 4.5) && (
                                <div className="absolute top-6 right-6 flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 italic shadow-sm">
                                    <Award className="w-3 h-3" /> Top Rated
                                </div>
                            )}

                            <div className="flex items-center gap-5 mb-6">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center text-2xl font-black border-2 border-white shadow-md overflow-hidden shrink-0">
                                    {tasker.avatar ? (
                                        <img src={tasker.avatar.startsWith('/') ? `http://localhost:5000${tasker.avatar}` : tasker.avatar} alt={tasker.name} className="w-full h-full object-cover" />
                                    ) : (
                                        tasker.name.charAt(0)
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl font-bold text-gray-900 truncate">{tasker.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                            <Star className="w-3 h-3 fill-current" />
                                            {tasker.rating || 'N/A'}
                                        </div>
                                        <span className="text-gray-300">|</span>
                                        <div className="text-gray-500 text-sm font-medium">
                                            {tasker.experience || 0} yrs exp
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 flex-1">
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 italic">
                                    "{tasker.bio || "Crafting exceptional digital experiences and solving complex problems with expertise."}"
                                </p>
                                
                                <div className="flex flex-wrap gap-2">
                                    {tasker.skills && tasker.skills.slice(0, 4).map((skill, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-gray-100">
                                            {skill}
                                        </span>
                                    ))}
                                    {tasker.skills?.length > 4 && (
                                        <span className="text-[10px] text-gray-400 font-bold ml-1">+{tasker.skills.length - 4} more</span>
                                    )}
                                </div>
                            </div>

                            <Link to={`/profile/${tasker._id}`} className="mt-auto pt-6 border-t border-gray-50">
                                <button className="w-full py-4 bg-gray-900 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 group-hover:bg-blue-600">
                                    View Detailed Profile
                                </button>
                            </Link>
                        </AnimatedCard>
                    ))}
                </div>

                {taskers.length === 0 && !loading && (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">No Professionals Found</h2>
                        <p className="text-gray-500 mt-2">Try adjusting your filters to find the right talent.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizerTalentSearch;
