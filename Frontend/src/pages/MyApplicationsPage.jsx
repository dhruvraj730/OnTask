import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyApplicationsPage = () => {
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('applications');
    const [applications, setApplications] = useState([]);
    const [activeContracts, setActiveContracts] = useState([]);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Update Form State
    const [updateJobId, setUpdateJobId] = useState(null);
    const [updateDescription, setUpdateDescription] = useState('');
    const [updateImage, setUpdateImage] = useState(''); // Simple string for now, could be file upload later

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            if (activeTab === 'applications') {
                const res = await axios.get('/api/applications/my-applications', config);
                setApplications(res.data);
            } else if (activeTab === 'active') {
                const res = await axios.get('/api/applications/active-contracts', config);
                setActiveContracts(res.data);
            } else if (activeTab === 'completed') {
                const res = await axios.get('/api/applications/completed', config);
                setCompletedJobs(res.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.post(
                `/api/work/${updateJobId}/progress`,
                { description: updateDescription, imageUrl: updateImage },
                config
            );

            alert('Update submitted successfully!');
            setUpdateJobId(null);
            setUpdateDescription('');
            setUpdateImage('');
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Error submitting update:', error);
            alert('Failed to submit update');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Applications</h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b">
                <button
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'applications' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('applications')}
                >
                    All Applications
                </button>
                <button
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Contracts
                </button>
                <button
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : (
                <div className="space-y-6">
                    {/* All Applications Tab */}
                    {activeTab === 'applications' && (
                        <div>
                            {applications.length === 0 ? (
                                <p className="text-gray-500">No applications found.</p>
                            ) : (
                                applications.map((app) => (
                                    <div key={app.jobId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-800">{app.jobTitle}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                                ${app.status === 'hired' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-1">{app.company}</p>
                                        <p className="text-gray-500 text-sm mb-4">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>

                                        {app.proposal && (
                                            <div className="bg-gray-50 p-3 rounded-md mb-3 text-sm text-gray-700">
                                                <span className="font-semibold block mb-1">Your Pitch:</span>
                                                "{app.proposal}"
                                            </div>
                                        )}

                                        {app.interviewStatus === 'scheduled' && (
                                            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center transition-all hover:shadow-md animate-pulse">
                                                <div>
                                                    <p className="text-sm font-bold text-blue-800">Interview Scheduled!</p>
                                                    <p className="text-xs text-blue-600">Date: {new Date(app.interviewDate).toLocaleString()}</p>
                                                </div>
                                                <a
                                                    href={app.interviewLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700"
                                                >
                                                    Join Interview
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Active Contracts Tab */}
                    {activeTab === 'active' && (
                        <div>
                            {activeContracts.length === 0 ? (
                                <p className="text-gray-500">No active contracts.</p>
                            ) : (
                                activeContracts.map((job) => (
                                    <div key={job._id} className="bg-white p-6 rounded-lg shadow-sm border border-green-100 mb-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                                                <p className="text-gray-600">{job.company}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-green-600 font-bold">{job.salary?.includes('$') ? job.salary.replace('$', '₹') : job.salary}</span>
                                                <span className="text-xs text-gray-400">Due in 2 weeks (Mock)</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar (Mock) */}
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-6">
                                            <span>Progress</span>
                                            <span>35%</span>
                                        </div>

                                        {/* Update Button or Form */}
                                        {updateJobId === job._id ? (
                                            <form onSubmit={handleSubmitUpdate} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <h4 className="font-semibold mb-3">Send Update to Provider</h4>
                                                <div className="mb-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">What have you accomplished?</label>
                                                    <textarea
                                                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                                        rows="3"
                                                        value={updateDescription}
                                                        onChange={(e) => setUpdateDescription(e.target.value)}
                                                        placeholder="Share your progress..."
                                                        required
                                                    ></textarea>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-2 border rounded-md"
                                                        value={updateImage}
                                                        onChange={(e) => setUpdateImage(e.target.value)}
                                                        placeholder="http://..."
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                                    >
                                                        Send Update
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setUpdateJobId(null)}
                                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() => setUpdateJobId(job._id)}
                                                className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                            >
                                                Submit Updates
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Completed Tab */}
                    {activeTab === 'completed' && (
                        <div>
                            {completedJobs.length === 0 ? (
                                <p className="text-gray-500">No completed jobs yet.</p>
                            ) : (
                                completedJobs.map((job) => (
                                    <div key={job._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 opacity-75 mb-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                                                <p className="text-gray-600">{job.company}</p>
                                            </div>
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                                                COMPLETED
                                            </span>
                                        </div>
                                        <div className="mt-4 text-sm text-gray-500">
                                            Completed on: {new Date(job.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyApplicationsPage;
