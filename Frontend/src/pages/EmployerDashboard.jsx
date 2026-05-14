import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Sparkles, MessageSquare, Clock, ArrowRight, User, Star, Briefcase } from 'lucide-react';
import AIChatbot from '../components/AIChatbot';
import { formatDate } from '../lib/dateUtils';

const EmployerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [talent, setTalent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [talentLoading, setTalentLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'employer') {
            navigate(user.role === 'job_seeker' ? '/tasker/dashboard' : '/');
            return;
        }

        const fetchJobs = async () => {
            try {
                const res = await axios.get('/api/jobs/my-jobs');
                setJobs(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchTalent = async () => {
            try {
                // Fetch top-rated talent
                const res = await axios.get('/api/search/taskers?sortBy=rating');
                setTalent(res.data.slice(0, 4)); // Show top 4
            } catch (err) {
                console.error("Error fetching talent:", err);
            } finally {
                setTalentLoading(false);
            }
        };

        fetchJobs();
        fetchTalent();
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Welcome Message */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
                <h2 className="text-3xl font-bold text-gray-900">
                    Welcome back, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'there'}</span> 👋
                </h2>
                <p className="text-gray-500 mt-1">Manage your projects and find top talent</p>
            </div>

            {/* Hero Section */}
            <div className="bg-transparent px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative shadow-2xl bg-blue-600 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-12">
                        <div className="space-y-6 z-10">
                            {/* Welcome greeting */}
                            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
                                <span className="text-2xl">
                                    {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 18 ? '☀️' : '🌙'}
                                </span>
                                <span className="text-sm font-semibold text-white/90">
                                    {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'},{' '}
                                    <span className="text-white font-bold">{user?.name?.split(' ')[0] || 'there'}</span>!
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                Build Your Dream Team
                            </h1>
                            <p className="text-blue-100 text-lg max-w-lg">
                                Connect with top talent, manage projects effortlessly, and scale your business with OnTask.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <button className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg shadow hover:bg-gray-100 transition-colors">
                                    Upgrade Plan
                                </button>
                                <Link to="/find-talent" className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg border border-blue-500 hover:bg-blue-800 transition-colors">
                                    Browse Talent
                                </Link>
                            </div>
                        </div>
                        {/* Right Graphic Mockup */}
                        <div className="hidden md:flex justify-center items-center relative">
                            <div className="bg-blue-500/30 backdrop-blur-sm p-8 rounded-2xl border border-blue-400/30 flex flex-col items-center">
                                <div className="flex -space-x-4 mb-4">
                                    {['A', 'S', 'M'].map(char => (
                                        <div key={char} className="w-12 h-12 rounded-full bg-gray-300 border-2 border-blue-600 flex items-center justify-center text-gray-700 bg-white shadow-sm font-bold">
                                            {char}
                                        </div>
                                    ))}
                                </div>
                                <p className="font-bold text-lg">Verified Professionals</p>
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">



                {/* Available Freelancers */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Available Freelancers</h3>
                        <Link to="/find-talent" className="text-sm font-semibold text-gray-500 hover:text-blue-600">View All Talent</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {talentLoading ? (
                            <p>Loading talent...</p>
                        ) : talent.length > 0 ? (
                            talent.map((freelancer) => (
                                <div key={freelancer._id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                                    <div className="flex flex-col flex-grow space-y-4">
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 line-clamp-1" title={freelancer.name}>{freelancer.name}</h4>
                                            <p className="text-sm text-gray-500 line-clamp-1" title={freelancer.professionalTitle || "Freelancer"}>{freelancer.professionalTitle || "Freelancer"}</p>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm mt-auto">
                                            <div className="flex items-center text-yellow-500 font-bold">
                                                <Star className="w-4 h-4 fill-current mr-1" />
                                                {freelancer.rating || 0}
                                                <span className="text-gray-400 font-normal ml-1">({freelancer.experience || 0} yrs exp)</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-gray-700 font-medium">
                                            <Clock className="w-4 h-4 mr-2" />
                                            ₹{freelancer.hourlyRate || 0}/hr
                                        </div>

                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700`}>
                                                Available
                                            </span>
                                        </div>
                                    </div>

                                    <Link to={`/profile/${freelancer._id}`} className="block mt-6">
                                        <button className="w-full py-2 bg-blue-900 text-white rounded-lg font-bold text-sm hover:bg-blue-800 transition-colors">
                                            View Profile
                                        </button>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 col-span-4 text-center py-8">No talent profiles found yet.</p>
                        )}
                    </div>
                </div>

                {/* AI Job Poster Banner */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-500 p-4 rounded-xl text-white shadow-lg">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">AI Job Poster</h3>
                            <p className="text-gray-500">Generate professional job posts instantly with AI</p>
                        </div>
                    </div>
                    <Link to="/pro/job/create" className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-md whitespace-nowrap">
                        Create Job
                    </Link>
                </div>

                {/* Active Projects */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Active Projects</h3>
                        <Link to="/pro/jobs" className="text-sm font-semibold text-gray-500 hover:text-blue-600">View All</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {loading ? (
                            <p>Loading projects...</p>
                        ) : jobs.length > 0 ? (
                            jobs.slice(0, 3).map((job) => {
                                const hiresCount = job.hires?.length || 0;
                                const avgProgress = hiresCount > 0
                                    ? Math.round(job.hires.reduce((acc, h) => acc + (h.progress || 0), 0) / hiresCount)
                                    : 0;

                                let assignedText = "Pending...";
                                if (job.jobStatus === 'open') {
                                    assignedText = "Searching...";
                                } else if (hiresCount === 1) {
                                    assignedText = job.hires[0].freelancer?.name || "1 Freelancer";
                                } else if (hiresCount > 1) {
                                    assignedText = `${hiresCount} Freelancers`;
                                }

                                return (
                                    <Link to={`/project/${job._id}`} key={job._id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                        <h4 className="font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">{job.title}</h4>
                                        <p className="text-gray-500 text-sm mb-4">
                                            Assigned to: <span className="font-semibold text-gray-900">
                                                {assignedText}
                                            </span>
                                        </p>

                                        <div className="mb-4 space-y-3">
                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-tight">
                                                    <span>Verified Progress</span>
                                                    <span className="text-emerald-600 font-bold">{avgProgress || 0}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${avgProgress || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-widest font-mono">
                                                    <span>Schedule Progress</span>
                                                    <span className="text-blue-500">{job.timeBasedProgress || 0}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                                                    <div
                                                        className="bg-blue-400 h-1 rounded-full transition-all duration-500"
                                                        style={{ width: `${job.timeBasedProgress || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-md">
                                                {job.startDate ? `Starts ${formatDate(job.startDate)}` : "Immediate"}
                                            </span>
                                            {job.endDate && (
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                    Due {formatDate(job.endDate)}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 col-span-3 text-center py-8">No active projects found. Use the AI Job Poster to start!</p>
                        )}
                    </div>
                </div>

                {/* Messages Mini Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Messages</h4>
                            <p className="text-sm text-gray-500">Communicate with your freelancers</p>
                        </div>
                    </div>
                    <Link to="/messages" className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                        Open Messages
                    </Link>
                </div>

            </div>
            <AIChatbot />
        </div>
    );
};

export default EmployerDashboard;
