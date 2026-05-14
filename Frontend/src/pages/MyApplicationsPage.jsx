import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatDateTime } from '../lib/dateUtils';

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
    const [proposedProgress, setProposedProgress] = useState(0);
    const [submittingUpdate, setSubmittingUpdate] = useState(false);

    const handleOpenUpdateModal = (job) => {
        setSelectedJobForUpdate(job);
        setUpdateDescription('');
        setUpdateImageUrl('');
        setProposedProgress(job.progress || 0);
        setShowUpdateModal(true);
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedJobForUpdate(null);
        setUpdateDescription('');
        setUpdateImageUrl('');
    };

    const handleRespondToNegotiation = async (jobId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this revised budget?`)) return;
        try {
            await axios.put(`/api/jobs/${jobId}/negotiate/respond`, { action }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
            alert(`Budget offer ${action}ed.`);
        } catch (error) {
            console.error('Error responding to negotiation:', error);
            alert(error.response?.data?.message || 'Failed to respond to negotiation');
        }
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
                { description: updateDescription, imageUrl: updateImageUrl, progress: proposedProgress },
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
                                        <p className="text-gray-500 text-sm mb-4">Applied on: {formatDate(app.appliedAt)}</p>

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
                                                    <p className="text-xs text-blue-600">Date: {formatDateTime(app.interviewDate)}</p>
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

                                        {app.offeredBudgetStatus === 'pending' && (
                                            <div className="mt-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-emerald-800">
                                                            {app.status === 'offered' ? 'Direct Hire Offer Received!' : 'New Budget Offer Received!'}
                                                        </p>
                                                        <p className="text-xs text-emerald-600 mt-1">
                                                            {app.status === 'offered' ? 'The employer wants to hire you directly for this contract.' : 'The organizer has proposed a revised budget for this project.'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-emerald-700">₹{app.offeredBudget}</p>
                                                        <p className="text-[10px] font-bold text-emerald-500 uppercase">
                                                            {app.status === 'offered' ? 'Contract Budget' : 'Revised Total'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleRespondToNegotiation(app.jobId, 'accept')}
                                                        className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10"
                                                    >
                                                        {app.status === 'offered' ? 'Accept Offer & Start' : 'Accept Offer'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRespondToNegotiation(app.jobId, 'reject')}
                                                        className="flex-1 bg-white text-red-600 border border-red-100 py-2 rounded-xl text-xs font-bold hover:bg-red-50 transition-all"
                                                    >
                                                        Reject Offer
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {app.offeredBudgetStatus !== 'none' && app.offeredBudgetStatus !== 'pending' && (
                                            <div className={`mt-4 p-3 rounded-xl border text-xs font-bold flex justify-between items-center ${app.offeredBudgetStatus === 'accepted' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                                                <span>Negotiated Budget: ₹{app.offeredBudget}</span>
                                                <span className="uppercase tracking-tighter">{app.offeredBudgetStatus}</span>
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
                                                <div className="flex flex-col items-end">
                                                    <span className="block text-2xl font-black text-green-600 leading-none">
                                                        ₹{job.agreedBudget || 0}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Contract Value</span>
                                                </div>
                                                {job.endDate && (
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                        Due {formatDate(job.endDate)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dynamic Progress Bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 shadow-sm overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2.5 rounded-full transition-all duration-1000 ease-in-out"
                                                style={{ width: `${job.progress || 0}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                                            <span className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                Manual Progress (Verified)
                                            </span>
                                            <span className="text-emerald-600">{job.progress || 0}%</span>
                                        </div>

                                        {/* Time Progress Bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 shadow-sm overflow-hidden">
                                            <div
                                                className="bg-blue-400 h-1.5 rounded-full transition-all duration-1000"
                                                style={{ width: `${job.timeBasedProgress || 0}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-6 font-mono">
                                            <span>Timeline Schedule</span>
                                            <span>{job.timeBasedProgress || 0}%</span>
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
                                                                        <div className="flex justify-between items-start">
                                                                            <p className="text-gray-800 font-medium">{update.description}</p>
                                                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${update.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                                update.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                                    'bg-yellow-100 text-yellow-700'
                                                                                }`}>
                                                                                {update.status}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-x-4 mt-1">
                                                                            {update.proposedProgress !== undefined && (
                                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Proposed: <span className="text-gray-600">{update.proposedProgress}%</span></p>
                                                                            )}
                                                                            {update.status === 'approved' && update.verifiedProgress !== undefined && (
                                                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight flex items-center gap-1">
                                                                                    Verified: <span>{update.verifiedProgress}%</span>
                                                                                    {update.verifiedProgress !== update.proposedProgress && (
                                                                                        <span className="text-[8px] bg-emerald-100 px-1 rounded-sm">REVISED</span>
                                                                                    )}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        {update.status === 'rejected' && update.rejectionReason && (
                                                                            <div className="mt-2 p-2 bg-red-50 rounded border border-red-100">
                                                                                <p className="text-[10px] font-bold text-red-400 uppercase mb-0.5">Rejection Reason</p>
                                                                                <p className="text-xs text-red-700 italic">"{update.rejectionReason}"</p>
                                                                            </div>
                                                                        )}
                                                                        {update.imageUrl && (
                                                                            <div className="mt-2">
                                                                                <img
                                                                                    src={update.imageUrl}
                                                                                    alt="Update attachment"
                                                                                    className="h-20 w-20 object-cover rounded-md border border-gray-200 hover:scale-105 transition-transform"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <p className="text-xs text-gray-500 mt-1">{formatDateTime(update.date)}</p>
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
                    )
                    }

                    {/* Completed Tab */}
                    {
                        activeTab === 'completed' && (
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
                                            <div className="mt-4 text-sm text-gray-500 mb-6">
                                                Completed on: {job.updatedAt ? formatDate(job.updatedAt) : 'Unknown date'}
                                            </div>

                                            {/* Client Feedback Section */}
                                            {(() => {
                                                const myHire = job.hires?.find(h => (h.freelancer?._id?.toString() || h.freelancer?.toString()) === (user?._id?.toString() || user?.id?.toString()));
                                                if (myHire && myHire.hasBeenReviewed) {
                                                    return (
                                                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl animate-in slide-in-from-left-2 transition-all">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Client Feedback</h3>
                                                                <div className="flex items-center text-amber-500 font-bold text-sm bg-white px-2 py-0.5 rounded-full shadow-sm">
                                                                    {myHire.review?.rating || 0} ⭐
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-blue-800 italic leading-relaxed">
                                                                "{myHire.review?.comment || 'The client didn\'t leave a written comment, but gave you a rating!'}"
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

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
                                                                            <div className="flex justify-between items-start">
                                                                                <p className="text-gray-800 font-medium">{update.description}</p>
                                                                                <span className="text-[9px] font-bold uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Approved</span>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-x-4 mt-1">
                                                                                {update.proposedProgress !== undefined && (
                                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Proposed: <span className="text-gray-600">{update.proposedProgress}%</span></p>
                                                                                )}
                                                                                {update.verifiedProgress !== undefined && (
                                                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Verified: <span className="text-emerald-700">{update.verifiedProgress}%</span></p>
                                                                                )}
                                                                            </div>
                                                                            {update.imageUrl && (
                                                                                <div className="mt-2">
                                                                                    <img
                                                                                        src={update.imageUrl}
                                                                                        alt="Update attachment"
                                                                                        className="h-20 w-20 object-cover rounded-md border border-gray-200"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <p className="text-xs text-gray-500 mt-2">{formatDateTime(update.date)}</p>
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
                        )
                    }
                </div >
            )}

            {/* Update Modal */}
            {
                showUpdateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20 transform animate-in zoom-in-95 duration-300">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                    Post Progress Update
                                </h3>
                                <button onClick={handleCloseUpdateModal} className="text-blue-100 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmitUpdate} className="p-8">
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 font-sans" htmlFor="description">
                                        What have you accomplished?
                                    </label>
                                    <textarea
                                        id="description"
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-sm leading-relaxed"
                                        placeholder="Briefly describe the tasks completed in this update..."
                                        value={updateDescription}
                                        onChange={(e) => setUpdateDescription(e.target.value)}
                                        required
                                    ></textarea>
                                </div>

                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center justify-between" htmlFor="progress">
                                        <span>Work Progress</span>
                                        <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg text-xs font-black">{proposedProgress}% Complete</span>
                                    </label>
                                    <div className="relative pt-2">
                                        <input
                                            id="progress"
                                            type="range"
                                            min="0"
                                            max="100"
                                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 relative z-10"
                                            value={proposedProgress}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                const minVal = selectedJobForUpdate?.progress || 0;
                                                setProposedProgress(Math.max(minVal, val));
                                            }}
                                        />
                                        {/* Visual Track for Verified Progress */}
                                        <div 
                                            className="absolute top-[18px] left-0 h-2 bg-blue-200 rounded-l-lg z-0 transition-all duration-300" 
                                            style={{ width: `${selectedJobForUpdate?.progress || 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-3 uppercase font-black tracking-widest">
                                        <span>Start (0%)</span>
                                        <span className="text-blue-500 px-2 py-0.5 bg-blue-50 rounded">Verified: {selectedJobForUpdate?.progress || 0}%</span>
                                        <span>Finish (100%)</span>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="imageUrl">
                                        Attachment URL (Optional)
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="imageUrl"
                                            type="text"
                                            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                                            placeholder="https://example.com/screenshot.png"
                                            value={updateImageUrl}
                                            onChange={(e) => setUpdateImageUrl(e.target.value)}
                                        />
                                        <div className="absolute right-3 top-3 text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.827a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Link a screenshot or external file as proof of work.</p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseUpdateModal}
                                        className="flex-1 px-6 py-3.5 bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 hover:text-gray-700 transition-all border border-gray-100"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingUpdate}
                                        className={`flex-[2] px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center ${submittingUpdate ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {submittingUpdate ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Submitting...</span>
                                            </div>
                                        ) : 'Send Update'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default MyApplicationsPage;
