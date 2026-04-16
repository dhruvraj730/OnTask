
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GlassContainer from '../components/premium/GlassContainer';
import { Star, ArrowLeft, MessageSquare, Briefcase, Zap, ExternalLink } from 'lucide-react';
import DirectHireModal from '../components/DirectHireModal';

const PublicProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview'); // 'Overview', 'Portfolio', 'Skills'
    const [isHireModalOpen, setIsHireModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/api/users/${id}`);
                setProfile(res.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div className="min-h-screen pt-20 text-center text-gray-500">Loading Profile...</div>;
    if (!profile) return (
        <div className="min-h-screen pt-20 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile not found.</h2>
            <button onClick={() => navigate(-1)} className="text-blue-600 font-bold hover:underline">Go Back</button>
        </div>
    );

    const TabButton = ({ name }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${activeTab === name
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
                }`}
        >
            {name}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm font-semibold transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Hero Profile Card */}
                <GlassContainer className="p-8 mb-8 border border-gray-100 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-5xl font-bold border-4 border-white shadow-xl overflow-hidden shrink-0">
                            {profile.avatar ? (
                                <img src={profile.avatar.startsWith('/') ? `http://localhost:5000${profile.avatar}` : profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                profile.name?.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-4xl font-extrabold text-gray-900">{profile.name}</h1>
                                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                                    <Star className="w-4 h-4 fill-current" />
                                    {profile.rating || 'N/A'}
                                    <span className="text-gray-400 font-normal ml-1">{profile.completedProjects || 0} jobs</span>
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-green-600 mb-6">{profile.professionalTitle || 'Tasker'}</h2>

                            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mb-8">
                                {profile.bio}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Hourly Rate</p>
                                    <p className="text-2xl font-extrabold text-gray-900">₹{profile.hourlyRate || 'Negotiable'}<span className="text-sm font-normal text-gray-500">{profile.hourlyRate ? '/hr' : ''}</span></p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Jobs Completed</p>
                                    <p className="text-2xl font-extrabold text-gray-900">{profile.completedProjects || 0}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Success Rate</p>
                                    <p className="text-2xl font-extrabold text-gray-900">{profile.successRate || 100}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassContainer>

                {/* Navigation Tabs */}
                <div className="bg-gray-200/50 p-1 rounded-full flex mb-8 max-w-2xl mx-auto shadow-inner">
                    <TabButton name="Overview" />
                    <TabButton name="Portfolio" />
                    <TabButton name="Skills" />
                    <TabButton name="Reviews" />
                </div>

                {/* Tab Content */}
                <div className="mb-12">
                    {activeTab === 'Overview' && (
                        <GlassContainer className="p-8 border border-gray-100 shadow-xl text-gray-700 leading-relaxed text-lg">
                            {profile.bio || "No biography provided."}
                        </GlassContainer>
                    )}

                    {activeTab === 'Portfolio' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile.portfolio && profile.portfolio.length > 0 ? profile.portfolio.map((item, idx) => (
                                <GlassContainer key={idx} className="group relative bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden flex flex-col">
                                    {item.imageUrl ? (
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={item.imageUrl.startsWith('/') ? `http://localhost:5000${item.imageUrl}` : item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <span className="text-white text-xs font-bold uppercase tracking-widest bg-blue-600/80 backdrop-blur-md px-3 py-1 rounded-full">Project Spotlight</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                                            <Briefcase className="w-16 h-16 text-gray-200" />
                                            <div className="absolute -right-4 -bottom-4 opacity-5">
                                                <Zap className="w-32 h-32" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</h3>
                                            {item.projectUrl && (
                                                <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                                            {item.description}
                                        </p>
                                        
                                        <div className="mt-auto pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                                            {item.skills && item.skills.map((skill, sIdx) => (
                                                <span key={sIdx} className="px-3 py-1 bg-blue-50/50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-md border border-blue-100/50">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </GlassContainer>
                            )) : (
                                <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Briefcase className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">Portfolio is empty</h4>
                                    <p className="text-gray-400 max-w-xs mx-auto">This professional hasn't showcased any specific projects yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Skills' && (
                        <GlassContainer className="p-8 border border-gray-100 shadow-xl">
                            <div className="flex flex-wrap gap-3">
                                {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill, idx) => (
                                    <span key={idx} className="px-6 py-3 bg-green-50 text-green-700 font-bold rounded-full border border-green-100 hover:bg-green-100 transition-colors">
                                        {skill}
                                    </span>
                                )) : (
                                    <p className="text-gray-500">No skills listed.</p>
                                )}
                            </div>
                        </GlassContainer>
                    )}

                    {activeTab === 'Reviews' && (
                        <div className="space-y-4">
                            {profile.reviews && profile.reviews.length > 0 ? profile.reviews.map((review, idx) => (
                                <GlassContainer key={idx} className="p-6 border border-gray-100 shadow-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{review.reviewerName || 'Client'}</h3>
                                            <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-1 font-bold text-yellow-500 bg-yellow-50 px-3 py-1 rounded-full text-sm">
                                            <Star className="w-4 h-4 fill-current" /> {review.rating}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mt-3 italic">"{review.comment}"</p>
                                </GlassContainer>
                            )) : (
                                <p className="text-center py-10 text-gray-500">No reviews yet.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4 max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate('/messages', { state: { recipientId: profile._id, recipientName: profile.name } })}
                        className="flex-1 py-4 px-8 bg-white border border-gray-200 text-gray-900 font-extrabold rounded-2xl hover:bg-gray-50 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <MessageSquare className="w-5 h-5" /> Send Message
                    </button>
                    <button 
                        onClick={() => setIsHireModalOpen(true)}
                        className="flex-[2] py-4 px-8 bg-green-600 text-white font-extrabold rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-600/20"
                    >
                        Hire Now
                    </button>
                </div>
            </div>

            {profile && (
                <DirectHireModal
                    isOpen={isHireModalOpen}
                    onClose={() => setIsHireModalOpen(false)}
                    freelancerId={profile._id}
                    freelancerName={profile.name}
                />
            )}
        </div>
    );
};

export default PublicProfilePage;
