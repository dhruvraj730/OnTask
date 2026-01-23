import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import GlassContainer from '../components/premium/GlassContainer';
import AnimatedCard from '../components/premium/AnimatedCard';

const TaskerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed'
    const [progress, setProgress] = useState({ description: '', imageUrl: '' });
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            // Need a new endpoint to get active jobs for tasker
            // For now, let's reuse search or assume an endpoint. 
            // Creating a specific query endpoint is best, or filtering.
            // Let's assume GET /api/jobs?hiredTasker={id} exists or we filter client side for MVP
            const res = await axios.get(`/api/search/jobs`);
            // Filtering locally since we don't have dedicated endpoint yet
            const myJobs = res.data.filter(j => j.hiredTasker === user._id || (j.applications && j.applications.some(a => a.applicant === user._id)));
            setJobs(myJobs);
        } catch (error) {
            console.error(error);
        }
    };

    const handleWithdraw = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/work/withdraw', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
            window.location.reload();
        } catch (error) {
            alert('Withdrawal failed');
        }
    };

    const submitProgress = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/work/${selectedJob._id}/progress`, progress, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Progress uploaded!');
            setSelectedJob(null);
            fetchJobs();
        } catch (error) {
            alert('Failed to update progress');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            {/* Wallet Section */}
            <div className="max-w-7xl mx-auto mb-10">
                <GlassContainer className="p-8 flex justify-between items-center bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                    <div>
                        <h2 className="text-2xl font-bold">My Wallet</h2>
                        <p className="text-blue-200">Total Earnings & Balance</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-extrabold">${user.walletBalance || 0}</div>
                        <button
                            onClick={handleWithdraw}
                            disabled={!user.walletBalance || user.walletBalance <= 0}
                            className="mt-2 px-6 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Withdraw Funds
                        </button>
                    </div>
                </GlassContainer>
            </div>

            {/* Jobs Section */}
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">My Jobs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.filter(j => j.hiredTasker === user._id).map(job => (
                        <AnimatedCard key={job._id}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">{job.title}</h3>
                                    <p className="text-gray-500">{job.company}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.jobStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                    job.jobStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {job.jobStatus.toUpperCase()}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <h4 className="font-bold text-sm mb-2">Progress Updates</h4>
                                {job.progressUpdates && job.progressUpdates.length > 0 ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {job.progressUpdates.map((u, idx) => (
                                            <div key={idx} className="text-xs border-l-2 border-blue-500 pl-2">
                                                <p className="font-medium">{new Date(u.date).toLocaleDateString()}</p>
                                                <p>{u.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-xs text-gray-400">No updates yet.</p>}
                            </div>

                            {job.jobStatus === 'in_progress' || job.jobStatus === 'hired' ? (
                                <button
                                    onClick={() => setSelectedJob(job)}
                                    className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                                >
                                    Add Progress Update
                                </button>
                            ) : null}
                        </AnimatedCard>
                    ))}
                    {jobs.filter(j => j.hiredTasker === user._id).length === 0 && (
                        <p className="text-gray-500">You have no active hired jobs.</p>
                    )}
                </div>
            </div>

            {/* Progress Modal */}
            {selectedJob && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Update Progress for {selectedJob.title}</h3>
                        <input
                            className="w-full p-2 border rounded mb-2"
                            placeholder="Image URL (e.g. https://imgur.com/...)"
                            value={progress.imageUrl}
                            onChange={e => setProgress({ ...progress, imageUrl: e.target.value })}
                        />
                        <textarea
                            className="w-full p-2 border rounded mb-4"
                            rows={3}
                            placeholder="Describe what you did..."
                            value={progress.description}
                            onChange={e => setProgress({ ...progress, description: e.target.value })}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setSelectedJob(null)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={submitProgress} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskerDashboard;
