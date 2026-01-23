import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const EmployerDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get('/api/jobs/my-jobs');
                setJobs(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchJobs();
    }, []);

    const handleReleasePayment = async (jobId, amount) => {
        if (!window.confirm(`Release $${amount} to the tasker? This cannot be undone.`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`/api/work/${jobId}/pay`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Payment Released Successfully!');
            // Refresh jobs
            const updatedJobs = jobs.map(j => j._id === jobId ? res.data : j);
            setJobs(updatedJobs);
        } catch (error) {
            console.error(error);
            alert('Failed to release payment');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
                <Link to="/pro/job/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Post a New Job
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {jobs.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                        <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
                        <Link to="/pro/job/create" className="text-blue-600 hover:text-blue-800 font-bold">
                            Post your first job query →
                        </Link>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <AnimatedCard key={job._id} className="relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                    <p className="text-sm text-gray-500">{job.location} • Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${job.jobStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                    job.jobStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                                        job.jobStatus === 'hired' ? 'bg-purple-100 text-purple-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {job.jobStatus.replace('_', ' ')}
                                </span>
                            </div>

                            <p className="text-gray-600 mb-6 line-clamp-2">{job.description}</p>

                            {/* Work Status & Payment Section */}
                            {job.jobStatus !== 'open' && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                        Work Progress & Payment
                                    </h4>

                                    <div className="flex items-center justify-between mb-4 bg-white p-3 rounded shadow-sm">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Escrow Balance</p>
                                            <p className="font-bold text-lg">${job.escrowAmount}</p>
                                        </div>
                                        {job.jobStatus !== 'paid' && job.escrowAmount > 0 ? (
                                            <button
                                                onClick={() => handleReleasePayment(job._id, job.escrowAmount)}
                                                className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 shadow-md transition-all transform hover:scale-105"
                                            >
                                                Release Payment 💸
                                            </button>
                                        ) : job.jobStatus === 'paid' && (
                                            <span className="text-green-600 font-bold flex items-center">
                                                Paid ✓
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress Updates */}
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Live Updates</p>
                                        {job.progressUpdates && job.progressUpdates.length > 0 ? (
                                            job.progressUpdates.map((u, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-sm">
                                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                        <span>{new Date(u.date).toLocaleDateString()}</span>
                                                        <span>Update #{idx + 1}</span>
                                                    </div>
                                                    <p className="text-gray-800 mb-2">{u.description}</p>
                                                    {u.imageUrl && (
                                                        <a href={u.imageUrl} target="_blank" rel="noreferrer" className="text-blue-500 text-xs hover:underline flex items-center">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                            View Proof
                                                        </a>
                                                    )}
                                                </div>
                                            ))
                                        ) : <div className="text-center text-gray-400 py-2 italic">Waiting for tasker updates...</div>}
                                    </div>
                                </div>
                            )}

                            {/* Applicants */}
                            <div className="border-t border-gray-100 pt-4">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                                    Applicants
                                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{job.applications?.length || 0}</span>
                                </h3>
                                {job.applications && job.applications.length > 0 ? (
                                    <div className="space-y-3">
                                        {job.applications.map((app, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs mr-3">
                                                        {app.applicantName?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="font-medium text-gray-800">{app.applicantName || "Candidate"}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleInterview(app.applicant, app.applicantName)}
                                                    className="text-xs bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm"
                                                >
                                                    Interview 💬
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No one has applied yet.</p>
                                )}
                            </div>
                        </AnimatedCard>
                    ))
                )}
            </div>
        </div>
    );
};

export default EmployerDashboard;
