import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import GlassContainer from '../components/premium/GlassContainer';
import GradientButton from '../components/premium/GradientButton';
import axios from 'axios';

const ProfilePage = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        bio: '',
        skills: '',
        hourlyRate: '',
        experience: '',
        reviews: []
    });
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
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
                reviews: userData.reviews || [],
                rating: userData.rating || 0
            });
            // Update the local user object if possible (though AuthContext might need a refresh function)
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

    const onSave = async () => {
        try {
            await updateProfile({
                ...profileData,
                skills: typeof profileData.skills === 'string' ? profileData.skills.split(',').map(s => s.trim()) : profileData.skills
            });
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert("Failed to update profile");
        }
    };

    if (!user) return <div className="p-10 text-center">Please log in to view profile.</div>;

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
                            <div className="h-32 w-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-4xl text-white font-bold mb-4 shadow-lg">
                                {user.name.charAt(0)}
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
                                        <p className="font-bold text-xl">₹{user.totalEarnings || 0}</p>
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
        </div>
    );
};

export default ProfilePage;
