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

    const [expandedHistory, setExpandedHistory] = useState({});

    const toggleHistory = (jobId) => {
        setExpandedHistory(prev => ({
            ...prev,
            [jobId]: !prev[jobId]
        }));
    };

    const [error, setError] = useState(null);

    // Update Modal State
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedJobForUpdate, setSelectedJobForUpdate] = useState(null);
    const [updateDescription, setUpdateDescription] = useState('');
    const [updateImageUrl, setUpdateImageUrl] = useState('');
    const [submittingUpdate, setSubmittingUpdate] = useState(false);

    const handleOpenUpdateModal = (job) => {
        setSelectedJobForUpdate(job);
        setUpdateDescription('');
        setUpdateImageUrl('');
        setShowUpdateModal(true);
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedJobForUpdate(null);
        setUpdateDescription('');
        setUpdateImageUrl('');
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        if (!selectedJobForUpdate) return;

        setSubmittingUpdate(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.post(
                `/api/jobs/${selectedJobForUpdate._id}/update`,
                { description: updateDescription, imageUrl: updateImageUrl },
                config
            );

            // Refresh data
            fetchData();
            handleCloseUpdateModal();
            // Optional: Show success message/toast
        } catch (error) {
            console.error('Error submitting update:', error);
            setError(error.response?.data?.message || 'Failed to submit update');
        } finally {
            setSubmittingUpdate(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, activeTab]);

    const fetchData = async () => {
        console.log("fetchData started. ActiveTab:", activeTab);
        setLoading(true);
        setError(null);

        // Failsafe timeout
        const timeoutId = setTimeout(() => {
            if (loading) {
                console.error("Fetch timed out!");
                setError("Request timed out. Please try refreshing.");
                setLoading(false);
            }
        }, 8000);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            if (activeTab === 'applications') {
                const res = await axios.get('/api/applications/my-applications', config);
                if (Array.isArray(res.data)) {
                    setApplications(res.data);
                } else {
                    setApplications([]);
                }
            } else if (activeTab === 'active') {
                const res = await axios.get('/api/applications/active-contracts', config);
                setActiveContracts(res.data);
            } else if (activeTab === 'completed') {
                const res = await axios.get('/api/applications/completed', config);
                setCompletedJobs(res.data);
            }
            clearTimeout(timeoutId);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message || "Failed to load data");
        } finally {
            setLoading(false);
            clearTimeout(timeoutId);
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
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-gray-500">
                    <p>Loading your applications...</p>
                    <p className="text-xs text-gray-400 mt-2">Connecting to server...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* All Applications Tab */}
                    {activeTab === 'applications' && (
                        <div>
                            <div className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 inline-block px-3 py-1 rounded-full">
                                Showing applications from last 15 days
                            </div>
                            {applications.length === 0 ? (
                                <p className="text-gray-500">No recent applications found.</p>
                            ) : (
                                applications.map((app) => (
                                    <div key={app.jobId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4">
                                        {/* ... (keep application item content) ... */}
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
                                                <span className="block text-green-600 font-bold">
                                                    {job.salary && String(job.salary).includes('₹')
                                                        ? String(job.salary)
                                                        : (String(job.salary).includes('$') ? String(job.salary).replaceAll('$', '₹') : job.salary || 'N/A')}
                                                </span>
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

                                        <div className="mb-4">
                                            <button
                                                onClick={() => handleOpenUpdateModal(job)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto"
                                                style={{ color: 'white' }}
                                            >
                                                Submit Update
                                            </button>
                                        </div>

                                        {/* Progress History Toggle */}
                                        {job.progressUpdates && job.progressUpdates.length > 0 && (
                                            <div className="mb-6">
                                                <button
                                                    onClick={() => toggleHistory(job._id)}
                                                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors mb-2 focus:outline-none"
                                                >
                                                    <span>{expandedHistory[job._id] ? 'Hide' : 'View'} Work History ({job.progressUpdates.length})</span>
                                                    <svg className={`w-4 h-4 transform transition-transform ${expandedHistory[job._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </button>

                                                {expandedHistory[job._id] && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                                        <div className="space-y-4">
                                                            {job.progressUpdates.slice().reverse().map((update, idx) => (
                                                                <div key={idx} className="flex gap-3 text-sm">
                                                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                                                                    <div className="flex-1">
                                                                        <p className="text-gray-800">{update.description}</p>
                                                                        {update.imageUrl && (
                                                                            <div className="mt-2">
                                                                                <img
                                                                                    src={update.imageUrl}
                                                                                    alt="Update attachment"
                                                                                    className="h-20 w-20 object-cover rounded-md border border-gray-200 hover:scale-105 transition-transform"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <p className="text-xs text-gray-500 mt-1">{new Date(update.date).toLocaleDateString()} at {new Date(update.date).toLocaleTimeString()}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
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
                                            Completed on: {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : 'Unknown date'}
                                        </div>

                                        {job.progressUpdates && job.progressUpdates.length > 0 && (
                                            <div className="mt-6">
                                                <button
                                                    onClick={() => toggleHistory(job._id)}
                                                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-2 focus:outline-none"
                                                >
                                                    <span>{expandedHistory[job._id] ? 'Hide' : 'View'} Work History ({job.progressUpdates.length})</span>
                                                    <svg className={`w-4 h-4 transform transition-transform ${expandedHistory[job._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </button>

                                                {expandedHistory[job._id] && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                                        <div className="space-y-4">
                                                            {job.progressUpdates.slice().reverse().map((update, idx) => (
                                                                <div key={idx} className="flex gap-3 text-sm">
                                                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                                                                    <div className="flex-1">
                                                                        <p className="text-gray-800">{update.description}</p>
                                                                        {update.imageUrl && (
                                                                            <div className="mt-2">
                                                                                <img
                                                                                    src={update.imageUrl}
                                                                                    alt="Update attachment"
                                                                                    className="h-20 w-20 object-cover rounded-md border border-gray-200 hover:scale-105 transition-transform"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <p className="text-xs text-gray-500 mt-1">{new Date(update.date).toLocaleDateString()} at {new Date(update.date).toLocaleTimeString()}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Update Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Submit Work Update</h3>
                            <button onClick={handleCloseUpdateModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitUpdate} className="p-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                    Description of Work
                                </label>
                                <textarea
                                    id="description"
                                    rows="4"
                                    className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe what you've accomplished..."
                                    value={updateDescription}
                                    onChange={(e) => setUpdateDescription(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                                    Image URL (Optional)
                                </label>
                                <input
                                    id="imageUrl"
                                    type="text"
                                    className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://example.com/image.png"
                                    value={updateImageUrl}
                                    onChange={(e) => setUpdateImageUrl(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Provide a direct link to a screenshot or file.</p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseUpdateModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingUpdate}
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center ${submittingUpdate ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {submittingUpdate ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : 'Submit Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyApplicationsPage;
