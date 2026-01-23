import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">OnTask</Link>
            <div className="flex items-center space-x-6">
                {user ? (
                    <>
                        <span className="text-gray-600 font-medium">Hello, {user.name}</span>
                        {user.role === 'employer' && (
                            <Link to="/pro/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Dashboard</Link>
                        )}
                        <button onClick={onLogout} className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Login</Link>
                        <Link to="/signup" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
