import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Button } from './ui/button';
import { Search, Bell, MessageSquare, ChevronDown, User, CheckCircle } from 'lucide-react';
import axios from 'axios';

export function Header() {
    const { user, logout, socket } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    const fetchNotifications = async () => {
        const currentToken = localStorage.getItem('token');
        if (!user || !currentToken) return;
        try {
            const resNotif = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            setNotifications(resNotif.data);

            const resMsg = await axios.get('/api/messages/unread-count', {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            setUnreadMessageCount(resMsg.data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications/messages", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = () => fetchNotifications();
        const handleNewNotification = () => fetchNotifications();

        socket.on('newMessage', handleNewMessage);
        socket.on('newNotification', handleNewNotification);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('newNotification', handleNewNotification);
        };
    }, [socket]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notif) => {
        const currentToken = localStorage.getItem('token');
        if (!notif.read) {
            try {
                await axios.put(`/api/notifications/${notif._id}/read`, {}, {
                    headers: { Authorization: `Bearer ${currentToken}` }
                });
                setNotifications(notifications.map(n => n._id === notif._id ? { ...n, read: true } : n));
            } catch (error) {
                console.error("Failed to mark notification as read");
            }
        }
        setShowNotifications(false);
        if (notif.link && !notif.link.startsWith('http')) {
            navigate(notif.link);
        }
    };

    const markAllRead = async () => {
        const currentToken = localStorage.getItem('token');
        try {
            await axios.put(`/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? "text-blue-600 font-bold" : "text-gray-600 hover:text-blue-600";

    return (
        <header className="sticky top-0 w-full z-50 bg-white border-b border-gray-100 font-sans">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-12">
                    <Link
                        to={user ? (user.role === 'employer' ? '/pro/dashboard' : '/tasker/dashboard') : '/'}
                        className="text-3xl font-bold tracking-tight text-blue-700 hover:opacity-90 transition-opacity"
                    >
                        OnTask
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-8 text-base font-medium">
                        {user && user.role === 'employer' ? (
                            <>
                                <Link to="/pro/dashboard" className={isActive('/pro/dashboard')}>Dashboard</Link>
                                <Link to="/pro/job/create" className={isActive('/pro/job/create')}>Post Job</Link>
                                <Link to="/my-jobs" className={isActive('/my-jobs')}>My Listings</Link>
                                <Link to="/find-talent" className={isActive('/find-talent')}>Find Talent</Link>
                            </>
                        ) : user && user.role === 'job_seeker' ? (
                            <>
                                <Link to="/tasker/dashboard" className={isActive('/tasker/dashboard')}>Dashboard</Link>
                                <Link to="/find-jobs" className={isActive('/find-jobs')}>Find Work</Link>
                                <Link to="/applications" className={isActive('/applications')}>Applied Jobs</Link>
                                <Link to="/earnings" className={isActive('/earnings')}>Earnings</Link>
                            </>
                        ) : (
                            // Guest Nav
                            <>
                            </>
                        )}
                    </nav>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            {/* Messages / Notifications */}
                            <Link to="/messages" title="Messages" className="relative text-gray-500 hover:text-blue-600 transition-colors mt-1">
                                <MessageSquare className="w-6 h-6" />
                                {unreadMessageCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce shadow-sm">
                                        {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                                    </span>
                                )}
                            </Link>
                            {/* Notifications Dropdown */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative text-gray-500 hover:text-blue-600 transition-colors focus:outline-none flex items-center mt-1"
                                >
                                    <Bell className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-50">
                                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                            <h3 className="font-bold text-gray-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllRead} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[60vh] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-gray-500 text-sm">
                                                    No notifications yet.
                                                </div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div
                                                        key={notif._id}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        <div className="flex-1">
                                                            <p className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                                                {notif.content}
                                                            </p>
                                                            {notif.type === 'interview' && notif.link && notif.link.startsWith('http') && (
                                                                <a href={notif.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-block mt-2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                                                                    Join Interview
                                                                </a>
                                                            )}
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">
                                                                {new Date(notif.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        {!notif.read && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dropdowns */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1 cursor-pointer group relative">
                                    <button className="flex items-center gap-1 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Tools <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                                    </button>

                                    {/* Tools Dropdown */}
                                    <div className="absolute left-0 top-full pt-2 w-52 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-[60]">
                                        <div className="bg-white shadow-xl rounded-xl border border-gray-100 py-3 overflow-hidden">
                                            <div className="px-4 pb-2 border-b border-gray-50 mb-2">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">AI Powered Tools</p>
                                            </div>
                                            
                                            {user.role === 'employer' && (
                                                <Link to="/pro/job/create?mode=ai" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                        <span className="text-sm">✨</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold leading-tight">AI Job Poster</p>
                                                        <p className="text-[10px] text-gray-500">Auto-generate posts</p>
                                                    </div>
                                                </Link>
                                            )}

                                            <Link to={user.role === 'employer' ? '/pro/dashboard?chat=open' : '/tasker/dashboard?chat=open'} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all">
                                                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                                    <span className="text-sm">🤖</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold leading-tight">AI Chat Bot</p>
                                                    <p className="text-[10px] text-gray-500">Intelligent assistant</p>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 cursor-pointer group relative">
                                    <Link to="/profile" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600">
                                        Account <ChevronDown className="w-4 h-4" />
                                    </Link>

                                    {/* Simple Dropdown Hover */}
                                    <div className="absolute right-0 top-full pt-2 w-48 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                                        <div className="bg-white shadow-xl rounded-xl border border-gray-100 py-2 overflow-hidden">
                                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                                <p className="font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Guest'}</p>
                                            </div>
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Profile</Link>
                                            <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Settings</Link>
                                            <div className="border-t border-gray-50 mt-1 pt-1">
                                                <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">Log Out</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                                Log In
                            </Link>
                            <Link to="/signup">
                                <Button className="rounded-full px-6 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
