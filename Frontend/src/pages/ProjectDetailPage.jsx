import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Clock, User, MessageSquare, Image as ImageIcon, Plus } from 'lucide-react';
import GlassContainer from '../components/premium/GlassContainer';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateModal, setUpdateModal] = useState(false);
    const [newUpdate, setNewUpdate] = useState({ description: '', imageUrl: '' });

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await axios.get(`/api/jobs/${id}`);
                setProject(res.data);
            } catch (err) {
                console.error("Failed to fetch project", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const handleAddUpdate = async () => {
        try {
            await axios.post(`/api/jobs/${id}/update`, newUpdate);
            const res = await axios.get(`/api/jobs/${id}`);
            setProject(res.data);
            setUpdateModal(false);
            setNewUpdate({ description: '', imageUrl: '' });
        } catch (err) {
            alert("Error adding update");
        }
    };

    if (loading) return <div className="min-h-screen pt-20 text-center">Loading project details...</div>;
    if (!project) return <div className="min-h-screen pt-20 text-center">Project not found</div>;

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
                                    <p className="text-3xl font-bold text-gray-900">₹{project.salary?.replace('$', '')}</p>
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
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Venue</p>
                                        <p className="font-bold text-gray-900">{project.venue || project.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Start Date</p>
                                        <p className="font-bold text-gray-900">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Progress</p>
                                        <p className="font-bold text-blue-600">45%</p>
                                    </div>
                                </div>
                            </div>
                        </GlassContainer>

                        {/* Progress Timeline */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-2">
                                <h3 className="text-xl font-bold text-gray-900">Project Timeline</h3>
                                <button
                                    onClick={() => setUpdateModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4" /> Add Update
                                </button>
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
                    </div>

                    {/* Right Column: Hired Tasker Info */}
                    <div className="space-y-8">
                        <GlassContainer className="p-6 border border-gray-100 shadow-xl">
                            <h3 className="font-bold text-gray-900 mb-6">Hired Tasker</h3>
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Rate</p>
                                            <p className="font-bold text-gray-900">₹{project.hiredTasker.hourlyRate || '35'}/hr</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                                            <p className="font-bold text-green-600 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Active
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/messages', { state: { recipientId: project.hiredTasker._id, recipientName: project.hiredTasker.name } })}
                                        className="w-full py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Message Tasker
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 italic">No tasker hired yet.</div>
                            )}
                        </GlassContainer>

                        <GlassContainer className="p-6 border border-gray-100 shadow-xl bg-blue-600 text-white">
                            <h3 className="font-bold mb-4">Milestone Progress</h3>
                            <div className="w-full bg-white/20 rounded-full h-3 mb-6">
                                <div className="bg-white h-3 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><CheckCircle className="w-3 h-3" /></div>
                                    <span className="opacity-80">Initial briefing complete</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><Clock className="w-3 h-3" /></div>
                                    <span className="font-bold">Execution phase</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm opacity-50">
                                    <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center"></div>
                                    <span>Final hand-off</span>
                                </div>
                            </div>
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
        </div>
    );
};

export default ProjectDetailPage;
