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
    const [reviewModal, setReviewModal] = useState({ open: false, updateId: null, action: '', reason: '', overriddenProgress: 0, currentProgressMax: 0 });
    const [payModalHire, setPayModalHire] = useState(null);

    const fetchProject = async () => {
        try {
            const res = await axios.get(`/api/jobs/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setProject(res.data);

            if (user && res.data.applications) {
                const isApplied = res.data.applications.some(app =>
                    app.applicant?._id === user._id || app.applicant === user._id
                );
                setHasApplied(isApplied);
            }

            if (res.data.screeningQuestions && applicationAnswers.length === 0) {
                const validQuestions = res.data.screeningQuestions.filter(q => q && q.trim() !== '');
                setApplicationAnswers(validQuestions.map(q => ({ question: q, answer: '' })));
            }
        } catch (err) {
            console.error("Failed to fetch project", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, user, token]);

    const handleAddUpdate = async () => {
        try {
            await axios.post(`/api/jobs/${id}/update`, newUpdate, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchProject();
            setUpdateModal(false);
            setNewUpdate({ description: '', imageUrl: '', progress: 0 });
        } catch (err) {
            alert("Error adding update");
        }
    };

    const handleOpenReview = (updateId, action, currentProposed, currentVerifiedProgress) => {
        setReviewModal({
            open: true,
            updateId,
            action,
            reason: '',
            overriddenProgress: currentProposed || currentVerifiedProgress || 0,
            currentProgressMax: currentVerifiedProgress || 0
        });
    };

    const handleConfirmReview = async () => {
        try {
            const { updateId, action, reason, overriddenProgress } = reviewModal;
            await axios.put(`/api/jobs/${id}/update/${updateId}/verify`, {
                action,
                rejectionReason: action === 'reject' ? reason : undefined,
                overrideProgress: action === 'approve' ? Number(overriddenProgress) : undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchProject();
            setReviewModal({ open: false, updateId: null, action: '', reason: '', overriddenProgress: 0, currentProgressMax: 0 });
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
            await fetchProject();
        } catch (err) {
            alert(err.response?.data?.message || "Error submitting application");
        }
    };

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading project details...</div>;
    if (!project) return <div className="min-h-screen pt-20 text-center">Project not found</div>;

    const myContract = user && project.hires?.find(h => h.freelancer?._id === user._id || h.freelancer === user._id);
    const isHiredTasker = !!myContract;
    const isEmployer = user && project.employer && (
        (project.employer._id?.toString() === user._id?.toString()) ||
        (project.employer?.toString() === user._id?.toString())
    );

    const formatSalary = (salary) => {
        if (!salary) return 'N/A';
        const str = salary.toString();
        return str.includes('$') ? str.replaceAll('$', '₹') : (str.includes('₹') ? str : `₹${str}`);
    };

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
                                        {isHiredTasker && myContract ? `₹${myContract.agreedBudget}` : 
                                         (project.budget ? `₹${isEmployer ? project.budget : Math.round(project.budget / (project.positionsRequired || 1))}` : formatSalary(project.salary))}
                                    </p>
                                    <p className="text-xs font-bold text-gray-400 uppercase">
                                        {isEmployer ? 'Total Job Budget' : 
                                         isHiredTasker ? 'Your Contract Value' : 
                                         (project.budget ? 'Budget per Worker' : 'Estimated Budget')}
                                    </p>
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

                                {/* Apply / Message Buttons for Job Seeker */}
                                {user && user.role === 'job_seeker' && project.jobStatus === 'open' && (
                                    <div className="flex gap-4 pt-6 mt-4 border-t border-gray-50">
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

                        {/* Freelancer Specific View */}
                        {isHiredTasker && myContract && (
                            <div className="space-y-8 pt-4">
                                <h2 className="text-2xl font-bold text-gray-900">My Contract Status</h2>
                                <GlassContainer className="p-8 border border-gray-100 shadow-xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Agreed Budget</p>
                                            <p className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                                                ₹{myContract.agreedBudget}
                                                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-emerald-100">Fixed</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Escrowed</p>
                                            <p className="text-lg font-bold text-gray-900">₹{myContract.escrowAmount}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Paid Amount</p>
                                            <p className="text-lg font-bold text-blue-600">₹{myContract.paidAmount}</p>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-gray-50 space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-gray-900 text-sm italic flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    Verified Work Progress
                                                </h3>
                                                <span className="text-sm font-bold text-emerald-600">{myContract.progress || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                                                <div
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-1000 ease-in-out"
                                                    style={{ width: `${myContract.progress || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassContainer>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center px-2">
                                        <h3 className="text-xl font-bold text-gray-900">Project Timeline</h3>
                                        <button
                                            onClick={() => {
                                                setNewUpdate({ ...newUpdate, progress: myContract.progress || 0 });
                                                setUpdateModal(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                                        >
                                            <Plus className="w-4 h-4" /> Add Update
                                        </button>
                                    </div>

                                    <TimelineUpdates
                                        updates={myContract.progressUpdates}
                                        hiredAt={myContract.hiredAt || project.updatedAt}
                                        isEmployer={false}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Employer Specific View */}
                        {isEmployer && project.hires && project.hires.length > 0 && (
                            <div className="space-y-8 pt-4">
                                <h2 className="text-2xl font-bold text-gray-900">Hired Freelancers</h2>
                                {project.hires.map((hire, idx) => (
                                    <div key={idx} className="space-y-6 mb-12">
                                        <GlassContainer className="p-8 border border-gray-100 shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 bg-blue-50 text-blue-600 font-bold text-[10px] uppercase rounded-bl-2xl">
                                                Contract {idx + 1}
                                            </div>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold border border-blue-100 shadow-sm">
                                                    {hire.freelancer?.name?.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 text-xl">{hire.freelancer?.name}</p>
                                                    <Link to={`/profile/${hire.freelancer?._id}`} className="text-sm font-bold text-blue-600 hover:underline inline-block mt-1">
                                                        View Profile
                                                    </Link>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/messages', { state: { recipientId: hire.freelancer?._id, recipientName: hire.freelancer?.name } })}
                                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
                                                >
                                                    <MessageSquare className="w-4 h-4" /> Message
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Agreed Budget</p>
                                                    <p className="font-bold text-gray-900 text-lg">₹{hire.agreedBudget}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Escrowed</p>
                                                    <p className="font-bold text-gray-900 text-lg">₹{hire.escrowAmount}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Paid</p>
                                                    <p className="font-bold text-blue-600 text-lg flex justify-between items-center">
                                                        ₹{hire.paidAmount}
                                                        <button
                                                            onClick={() => setPayModalHire(hire)}
                                                            className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg hover:bg-emerald-200 transition-all flex items-center gap-1 shadow-sm uppercase tracking-wider"
                                                        >
                                                            <Send className="w-3 h-3" /> Pay
                                                        </button>
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="font-bold text-gray-900 text-sm italic flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                        Verified Work Progress
                                                    </h3>
                                                    <span className="text-sm font-bold text-emerald-600">{hire.progress || 0}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                                                    <div
                                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-1000 ease-in-out"
                                                        style={{ width: `${hire.progress || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </GlassContainer>

                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-gray-900 px-2 mt-4">Timeline - {hire.freelancer?.name}</h3>
                                            <TimelineUpdates
                                                updates={hire.progressUpdates}
                                                hiredAt={hire.hiredAt}
                                                isEmployer={true}
                                                handleOpenReview={(updateId, action, proposed) => handleOpenReview(updateId, action, proposed, hire.progress)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: About Info if not hired */}
                    <div className="space-y-8">
                        {project.jobStatus === 'open' && (
                            <GlassContainer className="p-6 border border-gray-100 shadow-xl">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" /> About the Job
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-gray-500 text-sm">This job is currently open for applications.</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        Company Profile: <span className="font-bold text-gray-900">{project.company}</span>
                                    </div>
                                    <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-bold text-center border border-green-100">
                                        Open for Proposals
                                    </div>
                                </div>
                            </GlassContainer>
                        )}
                        {/* We could add summary widgets here for Employer, e.g., Total Spend across all hires */}
                    </div>
                </div>
            </div >

            {/* Modal for adding updates (for freelancer) */}
            {updateModal && (
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
                                    min={myContract?.progress || 0}
                                    max="100"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    value={newUpdate.progress}
                                    onChange={(e) => setNewUpdate({ ...newUpdate, progress: Math.max(myContract?.progress || 0, Number(e.target.value)) })}
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1 uppercase font-bold">
                                    <span>{myContract?.progress || 0}% Current</span>
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
            )}

            {/* Modal for Applying */}
            {applyModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 font-sans">Apply to this Job</h3>
                        <p className="text-gray-500 mb-6 text-sm">Explain why you're the best fit for this role.</p>

                        <div className="space-y-4 mb-8 max-h-[60vh] overflow-y-auto pr-2">
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
            )}

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
                                    <p className="text-xs text-gray-500 mb-4 font-sans">You can adjust the progress percentage if you feel it differs from the submitted work, but it cannot be lower than the current {reviewModal.currentProgressMax}%.</p>
                                    <input
                                        type="range"
                                        min={reviewModal.currentProgressMax}
                                        max="100"
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        value={reviewModal.overriddenProgress}
                                        onChange={(e) => setReviewModal({ ...reviewModal, overriddenProgress: Math.max(reviewModal.currentProgressMax, Number(e.target.value)) })}
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2 uppercase font-bold font-mono">
                                        <span>{reviewModal.currentProgressMax}%</span>
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
                hire={payModalHire}
                isOpen={!!payModalHire}
                onClose={() => setPayModalHire(null)}
                onSuccess={fetchProject}
            />
        </div>
    );
};

// Sub-component for rendering timeline updates cleanly
const TimelineUpdates = ({ updates, hiredAt, isEmployer, handleOpenReview }) => {
    return (
        <div className="space-y-6 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {updates && updates.length > 0 ? (
                updates.slice().reverse().map((update, idx) => (
                    <div key={idx} className="relative pl-16">
                        <div className="absolute left-6 top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm z-10"></div>
                        <GlassContainer className="p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all">
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
                                <img src={update.imageUrl} alt="Project Update" className="w-full h-48 object-cover rounded-xl mt-4 border border-gray-100" />
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
                <div className="pl-16 italic text-gray-400 text-sm">No updates yet.</div>
            )}

            {/* Milestone: Hired */}
            <div className="relative pl-16">
                <div className="absolute left-6 top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm z-10"></div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-left">
                    <p className="text-sm font-bold text-green-700">Contract Started / Tasker Hired</p>
                    <p className="text-xs text-green-600 mt-1">{hiredAt ? new Date(hiredAt).toLocaleDateString() : 'Unknown Date'}</p>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailPage;
