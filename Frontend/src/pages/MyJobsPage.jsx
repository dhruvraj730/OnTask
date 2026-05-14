import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Briefcase, Clock, Send } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import { formatDate, formatDateTime } from '../lib/dateUtils';

const MyJobsPage = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Open', 'In Progress', 'Completed'
    const [expandedHistory, setExpandedHistory] = useState({});

    const toggleHistory = (jobId) => {
        setExpandedHistory(prev => ({
            ...prev,
            [jobId]: !prev[jobId]
        }));
    };

    const fetchJobs = async () => {
        try {
            const res = await axios.get('/api/jobs/my-jobs');
            setJobs(res.data);
        } catch (err) {
            console.error("Failed to fetch jobs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    // Filter Logic
    const filteredJobs = jobs.filter(job => {
        if (activeTab === 'All') return true;
        const currentStatus = job.jobStatus?.toLowerCase().replace('_', ' ');
        return currentStatus === activeTab.toLowerCase();
    });

    const TabButton = ({ name }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${activeTab === name
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
                }`}
        >
            {name}
        </button>
    );

    if (loading) return <div className="min-h-screen pt-20 px-4 text-center">Loading jobs...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
                    {user.role === 'employer' && (
                        <Link to="/pro/job/create" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                            Post New Job
                        </Link>
                    )}
                </div>

                {/* Tabs */}
                <div className="bg-gray-200/50 p-1 rounded-full flex mb-8 max-w-2xl">
                    <TabButton name="All" />
                    <TabButton name="Open" />
                    <TabButton name="In Progress" />
                    <TabButton name="Completed" />
                </div>

                {/* Job List */}
                <div className="space-y-6">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map(job => {
                            // Calculate combined stats for multiple hires
                            const hiresCount = job.hires?.length || 0;
                            const avgProgress = hiresCount > 0
                                ? Math.round(job.hires.reduce((acc, h) => acc + (h.progress || 0), 0) / hiresCount)
                                : 0;

                            // Combine all progress updates from all hires, sort descending
                            let allUpdates = [];
                            if (job.hires) {
                                job.hires.forEach(h => {
                                    if (h.progressUpdates) {
                                        const annotated = h.progressUpdates.map(u => ({ ...u, freelancerName: h.freelancer?.name }));
                                        allUpdates.push(...annotated);
                                    }
                                });
                                allUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
                            }

                            const formatSalary = (salary) => {
                                if (!salary) return 'N/A';
                                const str = salary.toString();
                                return str.includes('$') ? str.replaceAll('$', '₹') : (str.includes('₹') ? str : `₹${str}`);
                            };

                            return (
                                <div key={job._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h2>
                                            <p className="text-sm text-gray-500">Posted {formatDate(job.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 md:mt-0">
                                            {allUpdates.some(u => u.status === 'pending') && (
                                                <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-sm shadow-amber-500/20">
                                                    PENDING VERIFICATION
                                                </span>
                                            )}
                                            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${job.jobStatus === 'completed' ? 'bg-green-100 text-green-700' :
                                                job.jobStatus === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {job.jobStatus?.replace('_', ' ') || 'Open'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Budget</p>
                                            <p className="font-bold text-gray-900">
                                                {job.budget ? `₹${job.budget}` : formatSalary(job.salary)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Applications</p>
                                            <p className="font-bold text-gray-900">{job.applications?.length || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Status</p>
                                            <p className="font-bold text-gray-900 capitalize">{job.jobStatus?.replace('_', ' ') || 'Open'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Hired ({hiresCount})</p>
                                            <div className="flex items-center gap-2">
                                                {hiresCount > 0 ? (
                                                    <div className="flex -space-x-2">
                                                        {job.hires.slice(0, 3).map((h, i) => (
                                                            <div key={i} className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border-2 border-white" title={h.freelancer?.name}>
                                                                {h.freelancer?.name?.charAt(0)}
                                                            </div>
                                                        ))}
                                                        {hiresCount > 3 && (
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                                                +{hiresCount - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">Not yet hired</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback for Job Seeker */}
                                    {user.role === 'job_seeker' && job.jobStatus === 'completed' && job.hires?.some(h => (h.freelancer?._id?.toString() || h.freelancer?.toString()) === (user?._id?.toString() || user?.id?.toString())) && (
                                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl animate-in slide-in-from-left-2 transition-all">
                                            {(() => {
                                                const myHire = job.hires.find(h => (h.freelancer?._id?.toString() || h.freelancer?.toString()) === (user?._id?.toString() || user?.id?.toString()));
                                                return (
                                                    <>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Client Feedback</h3>
                                                            <div className="flex items-center text-amber-500 font-bold text-sm bg-white px-2 py-0.5 rounded-full shadow-sm">
                                                                {myHire.review?.rating || 0} ⭐
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-blue-800 italic leading-relaxed">
                                                            "{myHire.review?.comment || 'The client didn\'t leave a written comment, but gave you a rating!'}"
                                                        </p>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {(job.jobStatus === 'in_progress' || job.jobStatus === 'completed') && (
                                        <div className="mb-8">
                                            <div className="space-y-4 mb-8">
                                                <div>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                            Average Verified Progress
                                                        </p>
                                                        <p className="text-sm font-bold text-emerald-600">{job.jobStatus === 'completed' ? '100%' : `${avgProgress}%`}</p>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                                                        <div
                                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-1000"
                                                            style={{ width: job.jobStatus === 'completed' ? '100%' : `${avgProgress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 font-mono">
                                                            <Clock className="w-3 h-3" /> Timeline Schedule
                                                        </p>
                                                        <span className="text-[10px] font-bold text-blue-500 font-mono">{job.timeBasedProgress || 0}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden shadow-inner">
                                                        <div
                                                            className="bg-blue-400 h-1 rounded-full transition-all duration-1000"
                                                            style={{ width: `${job.timeBasedProgress || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {allUpdates.length > 0 && (
                                                <div>
                                                    <button
                                                        onClick={() => toggleHistory(job._id)}
                                                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors mb-3 focus:outline-none"
                                                    >
                                                        <span>{expandedHistory[job._id] ? 'Hide' : 'View'} Recent Activity ({allUpdates.length})</span>
                                                        <svg className={`w-4 h-4 transform transition-transform ${expandedHistory[job._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </button>

                                                    {expandedHistory[job._id] && (
                                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                                            <div className="space-y-4">
                                                                {allUpdates.map((update, idx) => (
                                                                    <div key={idx} className="flex gap-3 text-sm">
                                                                        <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${update.status === 'approved' ? 'bg-green-500' : update.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                                                        <div className="flex-1">
                                                                            <div className="flex justify-between items-start">
                                                                                <p className="text-gray-800 font-medium">
                                                                                    {update.description}
                                                                                    <span className="text-[10px] text-gray-400 font-bold ml-2">by {update.freelancerName}</span>
                                                                                </p>
                                                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${update.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                                    update.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                                        'bg-yellow-100 text-yellow-700'
                                                                                    }`}>
                                                                                    {update.status}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-x-3 mt-1">
                                                                                {update.proposedProgress !== undefined && (
                                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Proposed: <span className="text-gray-600">{update.proposedProgress}%</span></p>
                                                                                )}
                                                                                {update.status === 'approved' && update.verifiedProgress !== undefined && (
                                                                                    <p className="text-[9px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                                                                                        Verified: <span>{update.verifiedProgress}%</span>
                                                                                        {update.verifiedProgress !== update.proposedProgress && (
                                                                                            <span className="text-[7px] bg-emerald-100 px-1 rounded-sm">REVISED</span>
                                                                                        )}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            {update.imageUrl && (
                                                                                <div className="mt-2 text-left">
                                                                                    <img
                                                                                        src={update.imageUrl}
                                                                                        alt="Update attachment"
                                                                                        className="h-24 w-auto object-cover rounded-md border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                                                                                        onClick={(e) => window.open(e.target.src, '_blank')}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <p className="text-xs text-gray-400 mt-1">{formatDateTime(update.date)}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4 border-t border-gray-100 pt-6">
                                        <Link to={`/project/${job._id}`} className="flex-2 w-full">
                                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 px-8">
                                                Manage Job
                                                {allUpdates.some(u => u.status === 'pending') && (
                                                    <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                                                )}
                                            </button>
                                        </Link>
                                        {user.role === 'employer' && (
                                            <Link to={`/pro/job/${job._id}/applications`} className="flex-1">
                                                <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition-colors">
                                                    Applications ({job.applications?.length || 0})
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">No jobs found</h3>
                            <p className="text-gray-500">There are no jobs in this category yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyJobsPage;
