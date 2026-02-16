import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Clock, User, MessageSquare, Image as ImageIcon, Plus, Send } from 'lucide-react';
import GlassContainer from '../components/premium/GlassContainer';
import AuthContext from '../context/AuthContext';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateModal, setUpdateModal] = useState(false);
    const [applyModal, setApplyModal] = useState(false);
    const [newUpdate, setNewUpdate] = useState({ description: '', imageUrl: '' });
    const [proposal, setProposal] = useState('');
    const [hasApplied, setHasApplied] = useState(false);

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
            setNewUpdate({ description: '', imageUrl: '' });
        } catch (err) {
            alert("Error adding update");
        }
    };

    const handleApply = async () => {
        try {
            await axios.post(`/api/jobs/${id}/apply`, { proposal }, {
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

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading project details...</div>;
    if (!project) return <div className="min-h-screen pt-20 text-center">Project not found</div>;

    const isHiredTasker = user && project.hiredTasker && (project.hiredTasker._id === user._id || project.hiredTasker === user._id);
    const isEmployer = user && (project.employer._id === user._id || project.employer === user._id);

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
                                    <p className="text-3xl font-bold text-gray-900">{project.salary?.includes('$') ? project.salary.replaceAll('$', '₹') : (project.salary?.includes('₹') ? project.salary : (project.salary ? `₹${project.salary}` : 'N/A'))}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Estimated Budget</p>
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
                                                        <p className="font-bold text-gray-900">{update.description}</p>
                                                        <span className="text-xs font-bold text-gray-400">{new Date(update.date).toLocaleString()}</span>
                                                    </div>
                                                    {update.imageUrl && (
                                                        <img src={update.imageUrl} alt="Project Update" className="w-full h-48 object-cover rounded-xl mt-4" />
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
                                        <button
                                            onClick={() => navigate('/messages', { state: { recipientId: project.hiredTasker._id, recipientName: project.hiredTasker.name } })}
                                            className="w-full py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
                                        >
                                            <MessageSquare className="w-4 h-4" /> Message Tasker
                                        </button>
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
            </div>

            {/* Modal for adding updates */}
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
        </div>
    );
};

export default ProjectDetailPage;
