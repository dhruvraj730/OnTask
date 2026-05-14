import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Users, Calendar, Link as LinkIcon, CheckCircle, Clock, Filter, Sparkles, MessageSquare } from 'lucide-react';
import GlassContainer from '../components/premium/GlassContainer';
import { formatDate } from '../lib/dateUtils';

const JobApplicationsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [interviewModal, setInterviewModal] = useState({ open: false, applicantId: null });
    const [interviewData, setInterviewData] = useState({ link: '', date: '' });
    const [negotiateModal, setNegotiateModal] = useState({ open: false, applicantId: null, applicantName: '', amount: '' });
    const [hireModal, setHireModal] = useState({ open: false, applicant: null, amount: '', isReadOnlyBudget: false });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await axios.get(`/api/jobs/${id}`);
                setJob(res.data);
            } catch (error) {
                console.error("Error fetching job details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleInvite = async () => {
        try {
            await axios.put(`/api/jobs/${id}/interview`, {
                applicantId: interviewModal.applicantId,
                interviewLink: interviewData.link,
                interviewDate: interviewData.date
            });
            // Refresh data
            const res = await axios.get(`/api/jobs/${id}`);
            setJob(res.data);
            setInterviewModal({ open: false, applicantId: null });
            setInterviewData({ link: '', date: '' });
        } catch (error) {
            alert("Error scheduling interview");
        }
    };

    const handleHire = async (applicantId, confirmedBudget) => {
        try {
            await axios.put(`/api/jobs/${id}/hire`, { 
                applicantId, 
                finalBudget: confirmedBudget 
            });
            const res = await axios.get(`/api/jobs/${id}`);
            setJob(res.data);
            setHireModal({ open: false, applicant: null, amount: '', isReadOnlyBudget: false });
            alert("Freelancer hired successfully!");
        } catch (error) {
            console.error("Error hiring freelancer:", error);
            alert(`Error hiring freelancer: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleReject = async (applicantId) => {
        if (!window.confirm("Are you sure you want to reject this freelancer?")) return;
        try {
            console.log(`[Reject] Sending request for applicant: ${applicantId} on job: ${id}`);
            await axios.put(`/api/jobs/${id}/reject`, { applicantId });
            const res = await axios.get(`/api/jobs/${id}`);
            setJob(res.data);
            alert("Application rejected.");
        } catch (error) {
            console.error("Error rejecting application:", error);
            alert(`Error rejecting application: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleNegotiate = async () => {
        if (!negotiateModal.amount || isNaN(negotiateModal.amount)) {
            alert("Please enter a valid amount");
            return;
        }
        try {
            await axios.post(`/api/jobs/${id}/negotiate`, {
                applicantId: negotiateModal.applicantId,
                amount: negotiateModal.amount
            });
            const res = await axios.get(`/api/jobs/${id}`);
            setJob(res.data);
            setNegotiateModal({ open: false, applicantId: null, applicantName: '', amount: '' });
            alert("Negotiation offer sent to freelancer!");
        } catch (error) {
            console.error("Error sending negotiation offer:", error);
            alert(error.response?.data?.message || "Error sending negotiation offer");
        }
    };

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading applications...</div>;
    if (!job) return <div className="min-h-screen pt-20 text-center">Job not found</div>;

    const applications = job.applications || [];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 bg-white px-4 py-2 rounded-lg shadow-sm font-semibold transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Job Header Info */}
                <GlassContainer className="p-8 mb-8 border border-gray-100 shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                            <p className="text-gray-500 max-w-2xl">{job.description}</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50">
                                <Calendar className="w-4 h-4" /> Schedule Interview
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-6 border-t border-gray-100">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Budget</p>
                            <p className="font-extrabold text-gray-900 text-lg">
                                {job.budget ? `₹${job.budget}` : (job.salary?.includes('$') ? job.salary.replaceAll('$', '₹') : (job.salary?.includes('₹') ? job.salary : (job.salary ? `₹${job.salary}` : 'N/A')))}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Timeline</p>
                            <p className="font-extrabold text-gray-900 text-lg">Event Based</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Status</p>
                            <p className="font-extrabold text-blue-600 text-lg capitalize">{job.jobStatus?.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Hiring Progress</p>
                            <div className="flex items-center gap-2">
                                <p className="font-extrabold text-gray-900 text-lg">
                                    {job.hires?.length || 0} / {job.positionsRequired || 1}
                                </p>
                                <Users className="w-4 h-4 text-blue-500" />
                            </div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
                                {(job.positionsRequired || 1) - (job.hires?.length || 0)} spots remaining
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Applications</p>
                            <p className="font-extrabold text-gray-900 text-lg">{applications.length}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Created</p>
                            <p className="font-extrabold text-gray-900 text-lg">{formatDate(job.createdAt)}</p>
                        </div>
                    </div>
                </GlassContainer>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Applications ({applications.length})</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-500 uppercase hidden sm:block">Positions Filled:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${(job.hires?.length || 0) >= (job.positionsRequired || 1) ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {job.hires?.length || 0} / {job.positionsRequired || 1}
                        </span>
                    </div>
                </div>

                {/* Applications List */}
                <div className="space-y-6">
                    {applications.length > 0 ? (
                        applications.map((app) => (
                            <GlassContainer
                                key={app._id}
                                className={`p-8 border ${app.status === 'hired' ? 'border-green-500 shadow-green-100' : 'border-gray-100'} shadow-lg hover:shadow-2xl transition-all`}
                            >
                                <div className="flex flex-col lg:flex-row justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{app.applicant.name}</h3>
                                                <p className="text-sm text-gray-500 font-medium">Applied {formatDate(app.appliedAt)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {job.budget ? `₹${job.budget}` : (job.salary?.includes('$') ? job.salary.replaceAll('$', '₹') : (job.salary?.includes('₹') ? job.salary : (job.salary ? `₹${job.salary}` : 'N/A')))}
                                                </p>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Proposed rate</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 pt-4 border-t border-gray-50">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Rating</p>
                                                <div className="flex items-center gap-1 font-bold text-gray-900">
                                                    <span className="text-orange-500">★</span> {app.applicant.rating || 'New'}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Jobs Completed</p>
                                                <p className="font-bold text-gray-900">{app.applicant.completedProjects || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Earnings</p>
                                                <p className="font-bold text-green-600">₹{app.applicant.totalEarnings ? (app.applicant.totalEarnings >= 100000 ? `${(app.applicant.totalEarnings / 100000).toFixed(1)}L` : app.applicant.totalEarnings) : '0'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-2xl mb-6">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Proposal Message</p>
                                            <p className="text-gray-700 leading-relaxed italic mb-4">
                                                "{app.proposal || "I'm interested in this role and have experience in similar events. I'm punctual and reliable."}"
                                            </p>

                                            {app.answers && app.answers.length > 0 && (
                                                <div className="pt-4 border-t border-gray-200">
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-3">Screening Answers</p>
                                                    <div className="space-y-4">
                                                        {app.answers.map((ans, idx) => (
                                                            <div key={idx}>
                                                                <p className="text-sm font-bold text-gray-800 mb-1">{ans.question}</p>
                                                                <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 italic">"{ans.answer || "No answer provided."}"</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {app.interviewStatus !== 'none' && (
                                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6 flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs font-bold text-purple-600 uppercase mb-1">Interview Status</p>
                                                    <p className="font-bold text-purple-900 capitalize flex items-center gap-2">
                                                        <Clock className="w-4 h-4" /> {app.interviewStatus}
                                                    </p>
                                                </div>
                                                {app.interviewLink && (
                                                    <a href={app.interviewLink} target="_blank" rel="noreferrer" className="text-sm font-bold text-purple-600 underline">
                                                        View Link
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {app.offeredBudgetStatus !== 'none' && (
                                            <div className={`p-4 rounded-xl border mb-6 flex justify-between items-center ${app.offeredBudgetStatus === 'accepted' ? 'bg-emerald-50 border-emerald-100' : (app.offeredBudgetStatus === 'rejected' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100')}`}>
                                                <div>
                                                    <p className={`text-xs font-bold uppercase mb-1 ${app.offeredBudgetStatus === 'accepted' ? 'text-emerald-600' : (app.offeredBudgetStatus === 'rejected' ? 'text-red-600' : 'text-blue-600')}`}>
                                                        Revised Budget Offer
                                                    </p>
                                                    <p className="font-bold text-gray-900 flex items-center gap-2">
                                                        ₹{app.offeredBudget} — <span className="capitalize">{app.offeredBudgetStatus}</span>
                                                    </p>
                                                </div>
                                                {app.offeredBudgetStatus === 'pending' && (
                                                    <div className="text-xs font-bold text-blue-500 animate-pulse">Waiting for freelancer...</div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                                            <Link
                                                to={`/profile/${app.applicant._id}`}
                                                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                                            >
                                                <User className="w-4 h-4" /> View Full Profile
                                            </Link>
                                            <button
                                                onClick={() => navigate('/messages', { state: { recipientId: app.applicant._id, recipientName: app.applicant.name } })}
                                                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm text-blue-600"
                                            >
                                                <MessageSquare className="w-4 h-4" /> Message
                                            </button>
                                            {app.status !== 'hired' && app.status !== 'rejected' && (
                                                <>
                                                    <button
                                                        onClick={() => setInterviewModal({ open: true, applicantId: app.applicant._id })}
                                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                                                    >
                                                        <Calendar className="w-4 h-4" /> Schedule Interview
                                                    </button>
                                                    <button
                                                        onClick={() => setNegotiateModal({ open: true, applicantId: app.applicant._id, applicantName: app.applicant.name, amount: '' })}
                                                        disabled={app.offeredBudgetStatus === 'pending'}
                                                        title={app.offeredBudgetStatus === 'pending' ? 'Waiting for seeker to respond to your current offer' : 'Send a revised budget offer'}
                                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${app.offeredBudgetStatus === 'pending' ? 'bg-amber-50 border border-amber-200 text-amber-500 cursor-not-allowed opacity-80' : 'bg-white border border-gray-200 hover:bg-gray-50 text-emerald-600'}`}
                                                    >
                                                        <Sparkles className="w-4 h-4" />
                                                        {app.offeredBudgetStatus === 'pending' ? 'Awaiting Reply...' : 'Negotiate Price'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(app.applicant._id)}
                                                        className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-all shadow-sm"
                                                    >
                                                        Reject Freelancer
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const isRangeJob = job.pricingType === 'range' || (job.minBudget > 0 && job.maxBudget > 0);
                                                            if (isRangeJob) {
                                                                // Determine the best default amount to show in the modal
                                                                let initialAmount;
                                                                let isReadOnly;
                                                                if (app.offeredBudgetStatus === 'accepted') {
                                                                    // Negotiation settled — locked to the accepted price, cannot change
                                                                    initialAmount = app.offeredBudget;
                                                                    isReadOnly = true;
                                                                } else if (app.offeredBudgetStatus === 'pending') {
                                                                    // Provider's own pending offer — hiring commits to this price, read-only
                                                                    initialAmount = app.offeredBudget;
                                                                    isReadOnly = true;
                                                                } else {
                                                                    // No offer, or offer was rejected — default to max budget, editable
                                                                    // Fallback chain: maxBudget → budget → parse salary string
                                                                    initialAmount = job.maxBudget > 0
                                                                        ? job.maxBudget
                                                                        : job.budget > 0
                                                                            ? job.budget
                                                                            : (parseInt((job.salary || '').replace(/\D/g, '')) || 0);
                                                                    isReadOnly = false;
                                                                }
                                                                setHireModal({ open: true, applicant: app.applicant, amount: initialAmount, isReadOnlyBudget: isReadOnly });
                                                            } else {
                                                                // For fixed jobs, simple confirm
                                                                if (window.confirm(`Confirm hiring ${app.applicant.name}?`)) {
                                                                    handleHire(app.applicant._id);
                                                                }
                                                            }
                                                        }}
                                                        disabled={(job.hires?.length || 0) >= (job.positionsRequired || 1)}
                                                        title={(job.hires?.length || 0) >= (job.positionsRequired || 1) ? 'All positions are already filled for this project' : ''}
                                                        className={`flex-1 font-bold py-3 px-8 rounded-xl transition-all shadow-lg ${(job.hires?.length || 0) >= (job.positionsRequired || 1) ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20'}`}
                                                    >
                                                        {(job.hires?.length || 0) >= (job.positionsRequired || 1) ? 'All Positions Filled' : 'Hire This Freelancer'}
                                                    </button>
                                                </>
                                            )}
                                            {app.status === 'hired' && (
                                                <div className="flex-1 space-y-3">
                                                    <div className="bg-green-50 text-green-700 font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 border border-green-200">
                                                        <CheckCircle className="w-5 h-5" /> Already Hired
                                                    </div>
                                                    {app.offeredBudgetStatus === 'accepted' && (
                                                        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex justify-between items-center border border-emerald-400">
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase opacity-80">Binding Agreement</p>
                                                                <p className="text-sm font-bold">Contracted at Negotiated Price</p>
                                                            </div>
                                                            <p className="text-xl font-black">₹{app.offeredBudget}</p>
                                                        </div>
                                                    )}
                                                    {app.offeredBudgetStatus === 'rejected' && (
                                                        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex justify-between items-center">
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase text-orange-500 mb-1">Offer Rejected by Seeker</p>
                                                                <p className="text-sm font-bold text-orange-800">Reverted to Max Budget</p>
                                                            </div>
                                                            <p className="text-xl font-black text-orange-700">₹{job.maxBudget || job.budget}</p>
                                                        </div>
                                                    )}
                                                    {/* Post-hire Budget Amendment: only for no-offer or rejected-offer cases, and only before escrow */}
                                                    {(() => {
                                                        const hireRecord = job.hires?.find(h => (h.freelancer?._id || h.freelancer)?.toString() === app.applicant?._id?.toString());
                                                        const escrowFunded = hireRecord && hireRecord.escrowAmount > 0;
                                                        const budgetLockedByAgreement = app.offeredBudgetStatus === 'accepted';

                                                        if (escrowFunded) {
                                                            return (
                                                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold">
                                                                    <span>🔒</span> Budget locked — escrow funded.
                                                                </div>
                                                            );
                                                        }
                                                        if (budgetLockedByAgreement) {
                                                            return (
                                                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold">
                                                                    <span>✅</span> Budget agreed — no further negotiation needed.
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <button
                                                                onClick={() => setNegotiateModal({ open: true, applicantId: app.applicant._id, applicantName: app.applicant.name, amount: '' })}
                                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm text-emerald-600 w-full justify-center"
                                                            >
                                                                <Sparkles className="w-3 h-3" /> Amend Budget
                                                            </button>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                            {app.status === 'rejected' && (
                                                <div className="flex-1 bg-red-50 text-red-700 font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 border border-red-200">
                                                    Rejected
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </GlassContainer>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">Waiting for applications...</h3>
                            <p className="text-gray-500">Applications will appear here once taskers start applying.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Interview Modal */}
            {interviewModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-2xl font-bold mb-6">Schedule Interview</h3>
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Interview Link (e.g. Zoom/Google Meet)</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                        value={interviewData.link}
                                        onChange={(e) => setInterviewData({ ...interviewData, link: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Interview Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                    value={interviewData.date}
                                    onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setInterviewModal({ open: false, applicantId: null })}
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInvite}
                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                            >
                                Send Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Negotiation Modal */}
            {negotiateModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">Negotiate Budget</h3>
                        </div>
                        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                            Propose a revised budget for <strong>{negotiateModal.applicantName}</strong>.
                            The freelancer will need to accept this offer before you can hire them at this price.
                        </p>
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">New Budget (₹)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</div>
                                    <input
                                        type="number"
                                        placeholder="e.g. 800"
                                        className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg"
                                        value={negotiateModal.amount}
                                        onChange={(e) => setNegotiateModal({ ...negotiateModal, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setNegotiateModal({ open: false, applicantId: null, applicantName: '', amount: '' })}
                                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNegotiate}
                                className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                            >
                                Send Offer
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Hire Confirmation Modal */}
            {hireModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl border border-slate-100 transform animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 rounded-3xl bg-green-50 text-green-600 shadow-inner">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Confirm Hire</h3>
                                <p className="text-slate-500 font-medium">Finalizing {hireModal.applicant?.name}</p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Project Pricing Guidance</p>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm font-bold text-slate-600">Defined Range</p>
                                        <p className="text-xl font-black text-slate-900">₹{job.minBudget} — ₹{job.maxBudget}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter mb-1">Recommended</div>
                                        <p className="text-sm text-slate-500">Secure the best talent</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-black text-slate-700 uppercase tracking-wide pl-1">Final Agreed Budget (₹)</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl group-focus-within:text-green-500 transition-colors">₹</div>
                                    <input
                                        type="number"
                                        placeholder="Enter final amount"
                                        className={`w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none ${hireModal.isReadOnlyBudget ? 'opacity-70 bg-slate-50 cursor-not-allowed' : 'focus:border-green-500 focus:ring-4 focus:ring-green-50'} transition-all font-black text-2xl text-slate-900 shadow-sm`}
                                        value={hireModal.amount}
                                        onChange={(e) => !hireModal.isReadOnlyBudget && setHireModal({ ...hireModal, amount: e.target.value })}
                                        readOnly={hireModal.isReadOnlyBudget}
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 font-bold italic pl-1 flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-amber-400" /> This amount will be locked in Escrow upon confirmation.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setHireModal({ open: false, applicant: null, amount: '', isReadOnlyBudget: false })}
                                className="flex-1 py-5 text-slate-500 font-black hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-xs"
                            >
                                Not yet
                            </button>
                            <button
                                onClick={() => handleHire(hireModal.applicant?._id, hireModal.amount)}
                                disabled={!hireModal.amount || Number(hireModal.amount) <= 0}
                                className="flex-[1.5] py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black shadow-xl shadow-slate-200 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                Confirm & Hire <ArrowLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobApplicationsPage;
