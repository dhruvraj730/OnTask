import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer className="bg-gray-950 text-white py-12 border-t border-gray-800">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-2xl font-bold mb-4">OnTask.</h3>
                    <p className="text-gray-400 text-sm">
                        Professional work, simplified. Connect with talent, get hired, and work your way.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold mb-4">For Clients</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link to="/find-talent" className="hover:text-white">Find Talent</Link></li>
                        <li><Link to="/pro/dashboard" className="hover:text-white">Dashboard</Link></li>
                        <li><Link to="/pro/job/create" className="hover:text-white">Post a Job</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4">For Talent</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link to="/find-jobs" className="hover:text-white">Find Work</Link></li>
                        <li><Link to="/tasker/dashboard" className="hover:text-white">My Dashboard</Link></li>
                        <li><Link to="/profile" className="hover:text-white">Profile</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Resources</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                        <li><Link to="/messages" className="hover:text-white">Help Center</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                © 2026 OnTask Global Inc.
            </div>
        </footer>
    );
}
