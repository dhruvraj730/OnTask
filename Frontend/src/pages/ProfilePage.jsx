import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import GlassContainer from '../components/premium/GlassContainer';
import GradientButton from '../components/premium/GradientButton';
import axios from 'axios';

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext); // Assuming setUser is available or we refresh
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        bio: '',
        skills: '',
        hourlyRate: '',
        experience: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                skills: user.skills ? user.skills.join(', ') : '',
                hourlyRate: user.hourlyRate || '',
                experience: user.experience || ''
            });
        }
    }, [user]);

    const onChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const onSave = async () => {
        try {
            // In a real app, we'd have a PUT /api/users/profile endpoint
            // For now, let's mock the success or assume an endpoint exists (I will need to create it)
            const res = await axios.put('http://localhost:5000/api/auth/profile', {
                ...profileData,
                skills: typeof profileData.skills === 'string' ? profileData.skills.split(',').map(s => s.trim()) : profileData.skills
            });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data)); // Persist update
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
                                        <p className="font-bold text-xl">{user.rating || 0} ⭐</p>
                                        <p className="text-xs text-gray-400">Rating</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-xl">${user.totalEarnings || 0}</p>
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

                            {user.role === 'job_seeker' && (
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
                                            <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
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
                            )}
                        </div>
                    </div>
                </GlassContainer>
            </div>
        </div>
    );
};

export default ProfilePage;
