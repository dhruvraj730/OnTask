
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Briefcase, ArrowRight, MessageSquare, Clock, CheckCircle } from 'lucide-react';

const MyJobsPage = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Open', 'In Progress', 'Completed'

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Fetching all jobs for the employer
                // Assuming /api/jobs/my-jobs returns all jobs created by the logged-in user
                const res = await axios.get('/api/jobs/my-jobs');
                setJobs(res.data);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    // Filter Logic
    const filteredJobs = jobs.filter(job => {
        if (activeTab === 'All') return true;
        // The model uses 'jobStatus'
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
                    <Link to="/pro/job/create" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        Post New Job
                    </Link>
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
                        filteredJobs.map(job => (
                            <div key={job._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h2>
                                        <p className="text-sm text-gray-500">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-2 md:mt-0 ${job.jobStatus === 'completed' ? 'bg-green-100 text-green-700' :
                                        job.jobStatus === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {job.jobStatus?.replace('_', ' ') || 'Open'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Budget</p>
                                        <p className="font-bold text-gray-900">{job.salary?.includes('$') ? job.salary.replace('$', '₹') : job.salary || 'N/A'}</p>
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
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Hired</p>
                                        <div className="flex items-center gap-2">
                                            {job.hiredTasker ? (
                                                <>
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                        {job.hiredTasker.name?.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-gray-900 text-sm truncate">{job.hiredTasker.name}</span>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">Not yet hired</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar (Mocked for now as backend might not have % yet) */}
                                {(job.jobStatus === 'in_progress' || job.jobStatus === 'completed') && (
                                    <div className="mb-8">
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-sm font-bold text-gray-700">Progress</p>
                                            <p className="text-sm font-bold text-blue-600">{job.jobStatus === 'completed' ? '100%' : '45%'}</p>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                                style={{ width: job.jobStatus === 'completed' ? '100%' : '45%' }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 border-t border-gray-100 pt-6">
                                    <Link to={`/pro/job/${job._id}/applications`} className="flex-1">
                                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                                            View Applications ({job.applications?.length || 0})
                                        </button>
                                    </Link>
                                    <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition-colors">
                                        Message Freelancer
                                    </button>
                                </div>
                            </div>
                        ))
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
