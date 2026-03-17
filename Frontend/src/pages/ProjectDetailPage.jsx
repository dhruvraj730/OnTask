import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Clock, User, MessageSquare, Image as ImageIcon, Plus, Send } from 'lucide-react';
import GlassContainer from '../components/premium/GlassContainer';
import AuthContext from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateModal, setUpdateModal] = useState(false);
    const [applyModal, setApplyModal] = useState(false);
    const [newUpdate, setNewUpdate] = useState({ description: '', imageUrl: '', progress: 0 });
    const [proposal, setProposal] = useState('');
    const [applicationAnswers, setApplicationAnswers] = useState([]);
    const [hasApplied, setHasApplied] = useState(false);
    const [reviewModal, setReviewModal] = useState({ open: false, updateId: null, action: '', reason: '', overriddenProgress: 0 });
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await axios.get(`/api/jobs/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setProject(res.data);

                // Check if user has already applied
                if (user && res.data.applications) {
                    const isApplied = res.data.applications.some(app => app.applicant._id === user._id || app.applicant === user._id);
                    setHasApplied(isApplied);
                }

                if (res.data.screeningQuestions) {
                    const validQuestions = res.data.screeningQuestions.filter(q => q && q.trim() !== '');
                    setApplicationAnswers(validQuestions.map(q => ({ question: q, answer: '' })));
                }
            } catch (err) {
                console.error("Failed to fetch project", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id, user, token]);

    const handleAddUpdate = async () => {
        try {
            await axios.post(`/api/jobs/${id}/update`, newUpdate, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const res = await axios.get(`/api/jobs/${id}`);
            setProject(res.data);
            setUpdateModal(false);
            setNewUpdate({ description: '', imageUrl: '', progress: project.progress || 0 });
        } catch (err) {
            alert("Error adding update");
        }
    };

    const handleOpenReview = (updateId, action, currentProposed) => {
        setReviewModal({
            open: true,
            updateId,
            action,
            reason: '',
            overriddenProgress: currentProposed || project.progress || 0
        });
    };

    const handleConfirmReview = async () => {
        try {
            const { updateId, action, reason, overriddenProgress } = reviewModal;
            console.log("Confirming Review:", { action, overriddenProgress, updateId });

            await axios.put(`/api/jobs/${id}/update/${updateId}/verify`, {
                action,
                rejectionReason: action === 'reject' ? reason : undefined,
                overrideProgress: action === 'approve' ? Number(overriddenProgress) : undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const res = await axios.get(`/api/jobs/${id}`);
            setProject(res.data);
            setReviewModal({ open: false, updateId: null, action: '', reason: '', overriddenProgress: 0 });
            alert(`Update ${action}d successfully`);
        } catch (err) {
            alert(err.response?.data?.message || `Error verifying update`);
        }
    };

    const handleApply = async () => {
        try {
            await axios.post(`/api/jobs/${id}/apply`, {
                proposal,
                answers: applicationAnswers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Application submitted successfully!");
            setApplyModal(false);
            setHasApplied(true);
            // Refresh project data
            const res = await axios.get(`/api/jobs/${id}`);
            setProject(res.data);
        } catch (err) {
            console.error("Apply Error:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Error submitting application");
        }
    };

    const fetchProject = async () => {
        try {
            const res = await axios.get(`/api/jobs/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setProject(res.data);
            if (user && res.data.applications) {
                const isApplied = res.data.applications.some(app => app.applicant._id === user._id || app.applicant === user._id);
                setHasApplied(isApplied);
            }
        } catch (err) {
            console.error("Failed to fetch project", err);
        }
    };

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading project details...</div>;
    if (!project) return <div className="min-h-screen pt-20 text-center">Project not found</div>;

    const isHiredTasker = user && project.hiredTasker && (
        (project.hiredTasker._id?.toString() === user._id?.toString()) ||
        (project.hiredTasker?.toString() === user._id?.toString())
    );
    const isEmployer = user && project.employer && (
        (project.employer._id?.toString() === user._id?.toString()) ||
        (project.employer?.toString() === user._id?.toString())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 bg-white px-4 py-2 rounded-lg shadow-sm font-semibold transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Project Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <GlassContainer className="p-8 border border-gray-100 shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                                    <p className="text-blue-600 font-bold flex items-center gap-2 uppercase tracking-wide text-xs">
                                        <Clock className="w-4 h-4" /> {project.jobStatus?.replace('_', ' ')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-gray-900">
                                        {project.budget ? `₹${project.budget}` : (project.salary?.includes('$') ? project.salary.replaceAll('$', '₹') : (project.salary?.includes('₹') ? project.salary : `₹${project.salary}`))}
                                    </p>
                                    <p className="text-xs font-bold text-gray-400 uppercase">
                                        {project.hiredTasker ? "Contracted Budget" : "Estimated Budget"}
                                    </p>
                                    {project.hiredTasker && project.applications?.find(a => (a.applicant._id || a.applicant) === (project.hiredTasker._id || project.hiredTasker))?.offeredBudgetStatus === 'accepted' && (
                                        <div className="mt-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold inline-block border border-emerald-100">
                                            NEGOTIATED & FIXED
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-600 leading-relaxed">{project.description}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-50">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Location</p>
                                        <p className="font-bold text-gray-900">{project.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Company</p>
                                        <p className="font-bold text-gray-900">{project.company}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Posted</p>
                                        <p className="font-bold text-blue-600">{new Date(project.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Starting Date</p>
                                        <p className="font-bold text-gray-900">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Due Date</p>
                                        <p className="font-bold text-red-600">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Work Duration</p>
                                        <p className="font-bold text-gray-900">{project.duration ? `${project.duration.value} ${project.duration.unit}` : 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Dynamic Progress Bar */}
                                {(isHiredTasker || isEmployer) && (
                                    <div className="pt-6 border-t border-gray-50 space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-gray-900 text-sm italic flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    Verified Work Progress
                                                </h3>
                                                <span className="text-sm font-bold text-emerald-600">{project.progress || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                                                <div
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-1000 ease-in-out"
                                                    style={{ width: `${project.progress || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-gray-900 text-[10px] uppercase tracking-widest flex items-center gap-2 text-gray-400 font-mono">
                                                    <Clock className="w-3 h-3" /> Timeline Schedule
                                                </h3>
                                                <span className="text-[10px] font-bold text-blue-500 font-mono">{project.timeBasedProgress || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                                                <div
                                                    className="bg-blue-400 h-full rounded-full transition-all duration-1000 ease-in-out"
                                                    style={{ width: `${project.timeBasedProgress || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest text-center">
                                            {project.progress === 0 && project.timeBasedProgress === 0 ? "Starting Soon" : project.progress === 100 ? "Project Complete" : "Work in Progress"}
                                        </p>
                                    </div>
                                )}

                                {/* Apply / Message Buttons for Job Seeker */}
                                {user && user.role === 'job_seeker' && project.jobStatus === 'open' && (
                                    <div className="flex gap-4 pt-6">
                                        {hasApplied ? (
                                            <button disabled className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl cursor-not-allowed">
                                                Applied
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setApplyModal(true)}
                                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                            >
                                                Apply Now
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate('/messages', { state: { recipientId: project.employer._id, recipientName: project.company } })}
                                            className="flex-1 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="w-5 h-5" /> Message Employer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </GlassContainer>

                        {/* Progress Timeline (Only visible if hired or employer) */}
                        {(isHiredTasker || isEmployer) && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center px-2">
                                    <h3 className="text-xl font-bold text-gray-900">Project Timeline</h3>
                                    {isHiredTasker && (
                                        <button
                                            onClick={() => setUpdateModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                                        >
                                            <Plus className="w-4 h-4" /> Add Update
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                    {project.progressUpdates && project.progressUpdates.length > 0 ? (
                                        project.progressUpdates.slice().reverse().map((update, idx) => (
                                            <div key={idx} className="relative pl-16">
                                                <div className="absolute left-6 top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm z-10"></div>
                                                <GlassContainer className="p-6 border border-gray-100 shadow-md">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <p className="font-bold text-gray-900">{update.description}</p>
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
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-bold text-gray-400 block mb-1">{new Date(update.date).toLocaleString()}</span>
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${update.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                update.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {update.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {update.imageUrl && (
                                                        <img src={update.imageUrl} alt="Project Update" className="w-full h-48 object-cover rounded-xl mt-4" />
                                                    )}

                                                    {isEmployer && update.status === 'pending' && (
                                                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                                                            <button
                                                                onClick={() => handleOpenReview(update._id, 'approve', update.proposedProgress)}
                                                                className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-green-600"
                                                            >
                                                                <CheckCircle className="w-4 h-4" /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenReview(update._id, 'reject')}
                                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}

                                                    {update.status === 'rejected' && update.rejectionReason && (
                                                        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                                                            <p className="text-xs font-bold text-red-400 uppercase mb-1">Rejection Reason</p>
                                                            <p className="text-sm text-red-700 italic">"{update.rejectionReason}"</p>
                                                        </div>
                                                    )}
                                                </GlassContainer>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="pl-16 italic text-gray-400">No updates yet.</div>
                                    )}

                                    {/* Milestone: Hired */}
                                    <div className="relative pl-16">
                                        <div className="absolute left-6 top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm z-10"></div>
                                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                            <p className="text-sm font-bold text-green-700">Project Started / Tasker Hired</p>
                                            <p className="text-xs text-green-600 mt-1">{new Date(project.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Hired Tasker Info (For Employer) or Employer Info (For Tasker) */}
                    <div className="space-y-8">
                        <GlassContainer className="p-6 border border-gray-100 shadow-xl">
                            <h3 className="font-bold text-gray-900 mb-6">
                                {project.hiredTasker ? "Hired Tasker" : "About the Job"}
                            </h3>

                            {project.hiredTasker ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold border border-blue-100">
                                            {project.hiredTasker.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">{project.hiredTasker.name}</p>
                                            <Link to={`/profile/${project.hiredTasker._id}`} className="text-sm font-bold text-blue-600 hover:underline">
                                                View Profile
                                            </Link>
                                        </div>
                                    </div>

                                    {isEmployer && (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => navigate('/messages', { state: { recipientId: project.hiredTasker._id, recipientName: project.hiredTasker.name } })}
                                                className="w-full py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
                                            >
                                                <MessageSquare className="w-4 h-4" /> Message Tasker
                                            </button>
                                            <button
                                                onClick={() => setIsPayModalOpen(true)}
                                                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                                            >
                                                <Send className="w-4 h-4" /> Pay Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-gray-500 text-sm">This job is currently open for applications.</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-4 h-4" /> {project.company}
                                    </div>
                                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold text-center">
                                        Open for Proposals
                                    </div>
                                </div>
                            )}
                        </GlassContainer>
                    </div>
                </div>
            </div >

            {/* Modal for adding updates */}
            {
                updateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 font-sans">Post Progress Update</h3>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Description</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                                        rows="4"
                                        placeholder="What's the status of the task?"
                                        value={newUpdate.description}
                                        onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Image URL (Optional)</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                                            value={newUpdate.imageUrl}
                                            onChange={(e) => setNewUpdate({ ...newUpdate, imageUrl: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Progress ({newUpdate.progress}%)</label>
                                    <input
                                        type="range"
                                        min={project?.progress || 0}
                                        max="100"
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        value={newUpdate.progress}
                                        onChange={(e) => setNewUpdate({ ...newUpdate, progress: Math.max(project?.progress || 0, Number(e.target.value)) })}
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1 uppercase font-bold">
                                        <span>{project?.progress || 0}% Current</span>
                                        <span>100% Finished</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setUpdateModal(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all font-sans"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddUpdate}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 font-sans"
                                >
                                    Post Update
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal for Applying */}
            {
                applyModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 font-sans">Apply to this Job</h3>
                            <p className="text-gray-500 mb-6 text-sm">Explain why you're the best fit for this role.</p>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Proposal / Cover Letter</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                                        rows="6"
                                        placeholder="I have 5 years of experience in..."
                                        value={proposal}
                                        onChange={(e) => setProposal(e.target.value)}
                                    ></textarea>
                                </div>

                                {applicationAnswers.length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <h4 className="font-bold text-gray-900">Screening Questions</h4>
                                        {applicationAnswers.map((item, idx) => (
                                            <div key={idx}>
                                                <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">{item.question}</label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                                                    rows="2"
                                                    placeholder="Your answer..."
                                                    value={item.answer}
                                                    onChange={(e) => {
                                                        const newAnswers = [...applicationAnswers];
                                                        newAnswers[idx].answer = e.target.value;
                                                        setApplicationAnswers(newAnswers);
                                                    }}
                                                ></textarea>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setApplyModal(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all font-sans"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 font-sans flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" /> Submit Application
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Review Modal (Approve/Reject) */}
            {reviewModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-2xl ${reviewModal.action === 'approve' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {reviewModal.action === 'approve' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6 rotate-180" />}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 font-sans">
                                {reviewModal.action === 'approve' ? 'Approve Update' : 'Reject Update'}
                            </h3>
                        </div>

                        <div className="space-y-6 mb-8">
                            {reviewModal.action === 'approve' ? (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Verified Progress ({reviewModal.overriddenProgress}%)</label>
                                    <p className="text-xs text-gray-500 mb-4 font-sans">You can adjust the progress percentage if you feel it differs from the submitted work, but it cannot be lower than the current {project?.progress || 0}%.</p>
                                    <input
                                        type="range"
                                        min={project?.progress || 0}
                                        max="100"
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        value={reviewModal.overriddenProgress}
                                        onChange={(e) => setReviewModal({ ...reviewModal, overriddenProgress: Math.max(project?.progress || 0, Number(e.target.value)) })}
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2 uppercase font-bold font-mono">
                                        <span>{project?.progress || 0}%</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Reason for Rejection</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-sans text-sm"
                                        rows="4"
                                        placeholder="Please explain why this update is being rejected..."
                                        value={reviewModal.reason}
                                        onChange={(e) => setReviewModal({ ...reviewModal, reason: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setReviewModal({ ...reviewModal, open: false })}
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all font-sans"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReview}
                                disabled={reviewModal.action === 'reject' && !reviewModal.reason}
                                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all font-sans disabled:opacity-50 disabled:cursor-not-allowed ${reviewModal.action === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}
                            >
                                Confirm {reviewModal.action === 'approve' ? 'Approval' : 'Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            <PaymentModal
                job={project}
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                onSuccess={fetchProject}
            />
        </div>
    );
};

export default ProjectDetailPage;
