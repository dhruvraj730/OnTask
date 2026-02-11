import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Calendar, Link as LinkIcon, CheckCircle, Clock, Filter, Sparkles, MessageSquare } from 'lucide-react';
import GlassContainer from '../components/premium/GlassContainer';

const JobApplicationsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [interviewModal, setInterviewModal] = useState({ open: false, applicantId: null });
    const [interviewData, setInterviewData] = useState({ link: '', date: '' });

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

    const handleHire = async (applicantId) => {
        if (!window.confirm("Are you sure you want to hire this freelancer?")) return;
        try {
            await axios.put(`/api/jobs/${id}/hire`, { applicantId });
            // Refresh data
            const res = await axios.get(`/api/jobs/${id}`);
            setJob(res.data);
            alert("Freelancer hired successfully!");
        } catch (error) {
            alert("Error hiring freelancer");
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
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50">
                                <Sparkles className="w-4 h-4" /> Add Assessment
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-6 border-t border-gray-100">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Budget</p>
                            <p className="font-extrabold text-gray-900 text-lg">{job.salary}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Timeline</p>
                            <p className="font-extrabold text-gray-900 text-lg">Event Based</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Status</p>
                            <p className="font-extrabold text-blue-600 text-lg capitalize">{job.jobStatus}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Applications</p>
                            <p className="font-extrabold text-gray-900 text-lg">{applications.length}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Created</p>
                            <p className="font-extrabold text-gray-900 text-lg">{new Date(job.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </GlassContainer>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Applications ({applications.length})</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50">
                        <Filter className="w-4 h-4" /> Filter by Assessment Score
                    </button>
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
                                                <p className="text-sm text-gray-500 font-medium">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">{job.salary}</p>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Proposed rate</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pt-4 border-t border-gray-50">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Rating</p>
                                                <div className="flex items-center gap-1 font-bold text-gray-900">
                                                    <span className="text-orange-500">★</span> 4.9
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Jobs Completed</p>
                                                <p className="font-bold text-gray-900">12</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Earnings</p>
                                                <p className="font-bold text-green-600">$4.5k</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Assessment Score</p>
                                                <div className="w-full bg-gray-100 rounded-full h-3 mt-1">
                                                    <div
                                                        className="bg-green-500 h-3 rounded-full"
                                                        style={{ width: `${app.assessmentScore || 85}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs font-bold text-green-600 mt-1">{app.assessmentScore || 85}%</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-2xl mb-6">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Proposal Message</p>
                                            <p className="text-gray-700 leading-relaxed italic">
                                                "{app.proposal || "I'm interested in this role and have experience in similar events. I'm punctual and reliable."}"
                                            </p>
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
                                            {app.status !== 'hired' && (
                                                <>
                                                    <button
                                                        onClick={() => setInterviewModal({ open: true, applicantId: app.applicant._id })}
                                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                                                    >
                                                        <Calendar className="w-4 h-4" /> Schedule Interview
                                                    </button>
                                                    <button
                                                        onClick={() => handleHire(app.applicant._id)}
                                                        className="flex-1 bg-green-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                                                    >
                                                        Hire This Freelancer
                                                    </button>
                                                </>
                                            )}
                                            {app.status === 'hired' && (
                                                <div className="flex-1 bg-green-50 text-green-700 font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 border border-green-200">
                                                    <CheckCircle className="w-5 h-5" /> Already Hired
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
        </div>
    );
};

export default JobApplicationsPage;
