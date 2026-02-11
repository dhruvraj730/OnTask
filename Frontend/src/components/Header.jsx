import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Button } from './ui/button';
import { Search, Bell, MessageSquare, ChevronDown, User } from 'lucide-react';

export function Header() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

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
                            <Link to="/messages" title="Messages" className="relative text-gray-500 hover:text-blue-600 transition-colors">
                                <MessageSquare className="w-6 h-6" />
                                {/* Placeholder for dynamic count */}
                                {false && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">0</span>}
                            </Link>
                            <Link to="/applications" title="Interviews & Alerts" className="relative text-gray-500 hover:text-blue-600 transition-colors">
                                <Bell className="w-6 h-6" />
                                {/* Placeholder for dynamic count */}
                                {false && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">0</span>}
                            </Link>

                            {/* Dropdowns */}
                            <div className="flex items-center gap-6">
                                <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600">
                                    Tools <ChevronDown className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-1 cursor-pointer group relative">
                                    <Link to="/profile" className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600">
                                        Account <ChevronDown className="w-4 h-4" />
                                    </Link>

                                    {/* Simple Dropdown Hover */}
                                    <div className="absolute right-0 top-full pt-2 w-48 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                                        <div className="bg-white shadow-xl rounded-xl border border-gray-100 py-2 overflow-hidden">
                                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                                <p className="font-bold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
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
