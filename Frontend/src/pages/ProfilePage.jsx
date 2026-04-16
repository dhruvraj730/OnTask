import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import GlassContainer from '../components/premium/GlassContainer';
import axios from 'axios';
import PortfolioModal from '../components/PortfolioModal';
import { Briefcase, Plus, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
    const { user, updateProfile, token } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        bio: '',
        skills: '',
        hourlyRate: '',
        experience: '',
        bankDetails: {
            accountHolderName: '',
            bankName: '',
        routingNumber: ''
        },
        reviews: [],
        totalEarnings: 0,
        portfolio: []
    });
    const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
    const [portfolioLoading, setPortfolioLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        try {
            if (!token) return;
            const res = await axios.get('/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userData = res.data;
            setProfileData({
                name: userData.name || '',
                email: userData.email || '',
                bio: userData.bio || '',
                skills: userData.skills ? (Array.isArray(userData.skills) ? userData.skills.join(', ') : userData.skills) : '',
                hourlyRate: userData.hourlyRate || '',
                experience: userData.experience || '',
                companyName: userData.companyName || '',
                industry: userData.industry || '',
                website: userData.website || '',
                hiringNeeds: userData.hiringNeeds ? (Array.isArray(userData.hiringNeeds) ? userData.hiringNeeds.join(', ') : userData.hiringNeeds) : '',
                bankDetails: userData.bankDetails || {
                    accountHolderName: '',
                    bankName: '',
                    accountNumber: '',
                    routingNumber: ''
                },
                reviews: userData.reviews || [],
                rating: userData.rating || 0,
                totalEarnings: userData.totalEarnings || 0,
                portfolio: userData.portfolio || []
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const onChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSave = async () => {
        try {
            const formData = new FormData();
            Object.keys(profileData).forEach(key => {
                if (key === 'skills') {
                    const skillsArr = typeof profileData.skills === 'string' ? profileData.skills.split(',').map(s => s.trim()) : profileData.skills;
                    formData.append('skills', JSON.stringify(skillsArr));
                } else if (key === 'businessAddress' || key === 'bankDetails') {
                    formData.append(key, JSON.stringify(profileData[key]));
                } else {
                    formData.append(key, profileData[key]);
                }
            });

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const response = await axios.put('/api/auth/profile', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            updateProfile(response.data);
            setIsEditing(false);
            setAvatarFile(null);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    const onAddPortfolioItem = async (projectData) => {
        setPortfolioLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', projectData.title);
            formData.append('description', projectData.description);
            formData.append('projectUrl', projectData.projectUrl || '');
            formData.append('skills', JSON.stringify(projectData.skills || []));
            
            if (projectData.imageFile) {
                formData.append('portfolio_image', projectData.imageFile);
            }

            const res = await axios.post('/api/auth/portfolio', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfileData({ ...profileData, portfolio: res.data });
            toast.success('Project added to portfolio!');
            setIsPortfolioModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to add project");
        } finally {
            setPortfolioLoading(false);
        }
    };

    const onDeletePortfolioItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to remove this project?')) return;
        try {
            const res = await axios.delete(`/api/auth/portfolio/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileData({ ...profileData, portfolio: res.data });
            toast.success('Project removed');
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove project");
        }
    };

    if (!user) return <div className="p-10 text-center">Please log in to view profile.</div>;
    if (loading) return <div className="p-10 text-center">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <GlassContainer className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        <button
                            onClick={() => isEditing ? onSave() : setIsEditing(true)}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Avatar & Basic Info */}
                        <div className="flex flex-col items-center text-center">
                            <div className="relative group mb-4">
                                <div className="h-32 w-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-lg overflow-hidden border-4 border-white">
                                    {avatarPreview || profileData.avatar ? (
                                        <img src={avatarPreview || (profileData.avatar?.startsWith('/') ? `http://localhost:5000${profileData.avatar}` : profileData.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-white">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </label>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>

                            {user.role === 'job_seeker' && (
                                <div className="mt-4 flex gap-4">
                                    <div className="text-center">
                                        <p className="font-bold text-xl">{profileData.rating || 0} ⭐</p>
                                        <p className="text-xs text-gray-400">Rating</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-xl">₹{profileData.totalEarnings || 0}</p>
                                        <p className="text-xs text-gray-400">Earned</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Editable Fields */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    disabled={!isEditing}
                                    value={profileData.name}
                                    onChange={onChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bio / Intro</label>
                                <textarea
                                    name="bio"
                                    rows={3}
                                    disabled={!isEditing}
                                    value={profileData.bio}
                                    onChange={onChange}
                                    placeholder="Tell organizers about yourself..."
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            {user.role === 'job_seeker' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                                        <input
                                            type="text"
                                            name="skills"
                                            disabled={!isEditing}
                                            value={profileData.skills}
                                            onChange={onChange}
                                            placeholder="e.g. Bartending, Driving, Cleaning"
                                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Hourly Rate (₹)</label>
                                            <input
                                                type="number"
                                                name="hourlyRate"
                                                disabled={!isEditing}
                                                value={profileData.hourlyRate}
                                                onChange={onChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                                            <input
                                                type="number"
                                                name="experience"
                                                disabled={!isEditing}
                                                value={profileData.experience}
                                                onChange={onChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                            />
                                        </div>
                                    </div>

                                    {/* Bank Details Section */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            🏦 Bank Details (For Withdrawals)
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase">Account Holder Name</label>
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={profileData.bankDetails?.accountHolderName || ''}
                                                    onChange={(e) => setProfileData({
                                                        ...profileData,
                                                        bankDetails: { ...profileData.bankDetails, accountHolderName: e.target.value }
                                                    })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                                    placeholder="As per bank records"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase">Bank Name</label>
                                                    <input
                                                        type="text"
                                                        disabled={!isEditing}
                                                        value={profileData.bankDetails?.bankName || ''}
                                                        onChange={(e) => setProfileData({
                                                            ...profileData,
                                                            bankDetails: { ...profileData.bankDetails, bankName: e.target.value }
                                                        })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                                        placeholder="e.g. HDFC, SBI"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 uppercase">Account Number</label>
                                                    <input
                                                        type="text"
                                                        disabled={!isEditing}
                                                        value={profileData.bankDetails?.accountNumber || ''}
                                                        onChange={(e) => setProfileData({
                                                            ...profileData,
                                                            bankDetails: { ...profileData.bankDetails, accountNumber: e.target.value }
                                                        })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                                        placeholder="0000000000"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase">IFSC / Routing Number</label>
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={profileData.bankDetails?.routingNumber || ''}
                                                    onChange={(e) => setProfileData({
                                                        ...profileData,
                                                        bankDetails: { ...profileData.bankDetails, routingNumber: e.target.value }
                                                    })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                                    placeholder="e.g. HDFC0001234"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Organizer / Employer Fields */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            disabled={!isEditing}
                                            value={profileData.companyName || ''}
                                            onChange={onChange}
                                            placeholder="Your Organization Name"
                                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Industry</label>
                                            <input
                                                type="text"
                                                name="industry"
                                                disabled={!isEditing}
                                                value={profileData.industry || ''}
                                                onChange={onChange}
                                                placeholder="e.g. Events"
                                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Website</label>
                                            <input
                                                type="url"
                                                name="website"
                                                disabled={!isEditing}
                                                value={profileData.website || ''}
                                                onChange={onChange}
                                                placeholder="https://..."
                                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Hiring Needs (comma separated)</label>
                                        <input
                                            type="text"
                                            name="hiringNeeds"
                                            disabled={!isEditing}
                                            value={profileData.hiringNeeds || ''}
                                            onChange={onChange}
                                            placeholder="e.g. Bartenders, DJs, Servers"
                                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Reviews Section for Job Seekers */}
                    {user.role === 'job_seeker' && (
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Reviews from Organizers</h3>
                            <div className="space-y-4">
                                {profileData.reviews && profileData.reviews.length > 0 ? profileData.reviews.map((review, idx) => (
                                    <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-gray-900">{review.reviewerName || 'Client'}</p>
                                                <p className="text-xs text-gray-400 uppercase font-bold">{new Date(review.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-500 font-bold bg-white px-3 py-1 rounded-full shadow-sm text-sm">
                                                <span className="text-lg">★</span> {review.rating}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 mt-2 italic font-sans text-sm">"{review.comment}"</p>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 font-medium">No reviews yet. Complete jobs to build your reputation!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </GlassContainer>
            </div>

            {/* Portfolio Section */}
            {user.role === 'job_seeker' && (
                <div className="max-w-4xl mx-auto mt-8">
                    <GlassContainer className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                    My Portfolio
                                </h3>
                                <p className="text-sm text-gray-500">Showcase your best projects to potential hirees.</p>
                            </div>
                            <button
                                onClick={() => setIsPortfolioModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                            >
                                <Plus className="w-4 h-4" /> Add Project
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profileData.portfolio && profileData.portfolio.length > 0 ? (
                                profileData.portfolio.map((item) => (
                                    <div key={item._id} className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 transition-all hover:shadow-xl">
                                        {item.imageUrl && (
                                            <div className="h-40 overflow-hidden">
                                                <img 
                                                    src={item.imageUrl.startsWith('/') ? `http://localhost:5000${item.imageUrl}` : item.imageUrl} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                />
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                                                <button 
                                                    onClick={() => onDeletePortfolioItem(item._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                                            
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {item.skills.map((skill, sIdx) => (
                                                    <span key={sIdx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            {item.projectUrl && (
                                                <a 
                                                    href={item.projectUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                                                >
                                                    View Project <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-400 font-medium italic">No projects added yet. Add your work to attract more clients!</p>
                                </div>
                            )}
                        </div>
                    </GlassContainer>
                </div>
            )}

            <PortfolioModal 
                isOpen={isPortfolioModalOpen}
                onClose={() => setIsPortfolioModalOpen(false)}
                onSave={onAddPortfolioItem}
                loading={portfolioLoading}
            />
        </div>
    );
};

export default ProfilePage;

