import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import GlassContainer from '../components/premium/GlassContainer';
import axios from 'axios';
import { Shield, Bell, Lock, Eye, Save, AlertCircle, Trash2 } from 'lucide-react';

const SettingsPage = () => {
    const { user, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('security');
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: true
        },
        privacy: {
            profileVisible: true,
            showOnlineStatus: true
        }
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [qrCodeData, setQrCodeData] = useState('');
    const [secret2FA, setSecret2FA] = useState('');
    const [showSetup2FA, setShowSetup2FA] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleDeactivateAccount = async () => {
        const confirmed = window.confirm(
            "ARE YOU SURE? \n\nDeactivating your account will hide your profile and close all your active job postings. You will be logged out immediately."
        );

        if (!confirmed) return;

        setSaving(true);
        try {
            await axios.put('/api/auth/deactivate', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Account deactivated successfully. You will now be logged out.");
            logout();
            navigate('/login');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to deactivate account' });
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            if (!token) return;
            const res = await axios.get('/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.settings) {
                setSettings(res.data.settings);
            }
            if (res.data.isTwoFactorEnabled !== undefined) {
                setIsTwoFactorEnabled(res.data.isTwoFactorEnabled);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsChange = (category, field) => {
        setSettings({
            ...settings,
            [category]: {
                ...settings[category],
                [field]: !settings[category][field]
            }
        });
    };

    const saveSettings = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await axios.put('/api/auth/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        setSaving(true);
        try {
            await axios.put('/api/auth/change-password-auth', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
        } finally {
            setSaving(false);
        }
    };

    const handleGenerate2FA = async () => {
        try {
            const res = await axios.get('/api/auth/2fa/generate', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQrCodeData(res.data.qrcode);
            setSecret2FA(res.data.secret);
            setShowSetup2FA(true);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error generating 2FA secret' });
        }
    };

    const handleEnable2FA = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('/api/auth/2fa/enable', { code: twoFactorToken }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: '2FA enabled successfully' });
            setIsTwoFactorEnabled(true);
            setShowSetup2FA(false);
            setTwoFactorToken('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Invalid 2FA code' });
        } finally {
            setSaving(false);
        }
    };

    const handleDisable2FA = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('/api/auth/2fa/disable', { code: twoFactorToken }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: '2FA disabled successfully' });
            setIsTwoFactorEnabled(false);
            setTwoFactorToken('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Invalid 2FA code' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading settings...</div>;

    const tabs = [
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Eye }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3">
                        <GlassContainer className="p-8">
                            {message.text && (
                                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    <AlertCircle className="w-5 h-5 text-current" />
                                    <p className="text-sm font-medium">{message.text}</p>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Lock className="w-6 h-6 text-blue-600" /> Change Password
                                        </h3>
                                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            >
                                                {saving ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </form>
                                    </div>
                                    <div className="pt-8 border-t border-gray-100">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            Two-Factor Authentication
                                        </h3>
                                        {isTwoFactorEnabled ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                                                    <Shield className="w-5 h-5" />
                                                    <span className="font-medium">2FA is currently enabled</span>
                                                </div>
                                                <p className="text-gray-500 text-sm">To disable 2FA, enter a code from your authenticator app below.</p>
                                                <form onSubmit={handleDisable2FA} className="flex flex-col gap-3 max-w-sm">
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="6-digit code"
                                                        value={twoFactorToken}
                                                        onChange={(e) => setTwoFactorToken(e.target.value)}
                                                        className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <button type="submit" disabled={saving} className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-lg border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50">
                                                        Disable 2FA
                                                    </button>
                                                </form>
                                            </div>
                                        ) : showSetup2FA ? (
                                            <div className="space-y-4">
                                                <p className="text-gray-700 font-medium">1. Scan this QR Code with your Authenticator App</p>
                                                <div className="bg-white p-2 border border-gray-200 rounded-xl inline-block">
                                                     <img src={qrCodeData} alt="2FA QR Code" className="w-48 h-48" />
                                                </div>
                                                <p className="text-sm text-gray-500">Or manually enter this secret: <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">{secret2FA}</span></p>
                                                <p className="text-gray-700 font-medium mt-4">2. Enter the 6-digit code</p>
                                                <form onSubmit={handleEnable2FA} className="flex flex-col gap-3 max-w-sm">
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="6-digit code"
                                                        value={twoFactorToken}
                                                        onChange={(e) => setTwoFactorToken(e.target.value)}
                                                        className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <button type="submit" disabled={saving} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                                        Enable 2FA
                                                    </button>
                                                    <button type="button" onClick={() => setShowSetup2FA(false)} className="text-sm text-gray-500 hover:underline">Cancel</button>
                                                </form>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-gray-500 text-sm mb-4">Add an extra layer of security to your account.</p>
                                                <button onClick={handleGenerate2FA} className="px-4 py-2 border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors">
                                                    Setup 2FA
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <Bell className="w-6 h-6 text-blue-600" /> Notification Channels
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-gray-800">Email Notifications</p>
                                                    <p className="text-sm text-gray-500">Receive job updates and payments via email.</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={settings.notifications.email} onChange={() => handleSettingsChange('notifications', 'email')} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-gray-800">Push Notifications</p>
                                                    <p className="text-sm text-gray-500">Receive real-time alerts in your browser/app.</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={settings.notifications.push} onChange={() => handleSettingsChange('notifications', 'push')} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100">
                                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Specific Alerts</h4>
                                                <div className="space-y-4">
                                                    {[
                                                        { id: 'jobAlerts', label: 'Job Alerts', desc: 'New job opportunities matching your profile.' },
                                                        { id: 'applicationUpdates', label: 'Application Updates', desc: 'Alerts when your application status changes.' },
                                                        { id: 'messages', label: 'Messages', desc: 'Real-time notifications for new chat messages.' },
                                                        { id: 'payments', label: 'Payments & Escrow', desc: 'Updates on deposits and payment releases.' },
                                                        { id: 'workUpdates', label: 'Work Updates', desc: 'Progress verification and milestone alerts.' }
                                                    ].map(pref => (
                                                        <div key={pref.id} className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-bold text-gray-800 text-sm">{pref.label}</p>
                                                                <p className="text-[10px] text-gray-500">{pref.desc}</p>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input type="checkbox" checked={settings.notifications[pref.id] ?? true} onChange={() => handleSettingsChange('notifications', pref.id)} className="sr-only peer" />
                                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={saveSettings}
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            )}

                            {activeTab === 'privacy' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <Eye className="w-6 h-6 text-blue-600" /> Privacy & Visibility
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-gray-800">Public Profile</p>
                                                    <p className="text-sm text-gray-500">Allow recruiters to find your profile in searches.</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={settings.privacy.profileVisible} onChange={() => handleSettingsChange('privacy', 'profileVisible')} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-gray-800">Online Status</p>
                                                    <p className="text-sm text-gray-500">Show when you are active on the platform.</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={settings.privacy.showOnlineStatus} onChange={() => handleSettingsChange('privacy', 'showOnlineStatus')} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={saveSettings}
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            )}
                        </GlassContainer>

                        {/* Danger Zone */}
                        <div className="mt-8">
                            <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4">Danger Zone</h3>
                            <GlassContainer className="p-6 border-red-100 bg-red-50/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900">Deactivate Account</p>
                                        <p className="text-sm text-gray-500">Temporarily hide your profile and jobs.</p>
                                    </div>
                                    <button 
                                        onClick={handleDeactivateAccount}
                                        disabled={saving}
                                        className="px-4 py-2 border border-red-600 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
                                    >
                                        {saving ? 'Deactivating...' : 'Deactivate'}
                                    </button>
                                </div>
                            </GlassContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
