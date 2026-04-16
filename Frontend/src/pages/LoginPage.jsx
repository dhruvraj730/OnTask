import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const { email, password } = formData;

    const [showPassword, setShowPassword] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [requiresReactivation, setRequiresReactivation] = useState(false);
    const [userIdFor2FA, setUserIdFor2FA] = useState(null);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [reactivating, setReactivating] = useState(false);

    const { login, reactivate, verify2FALogin, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'employer') navigate('/pro/dashboard');
            else if (user.role === 'job_seeker') navigate('/tasker/dashboard');
            else navigate('/');
        }
    }, [user, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await login(email, password);
            if (userData && userData.requiresReactivation) {
                setRequiresReactivation(true);
                return;
            }
            if (userData && userData.requires2FA) {
                setRequires2FA(true);
                setUserIdFor2FA(userData.userId);
                return;
            }
            if (userData.role === 'employer') navigate('/pro/dashboard');
            else if (userData.role === 'job_seeker') navigate('/tasker/dashboard');
            else navigate('/');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Login Failed';
            alert(msg);
        }
    };

    const handleReactivate = async () => {
        setReactivating(true);
        try {
            const userData = await reactivate(email, password);
            alert("Success! Your account has been reactivated.");
            if (userData.role === 'employer') navigate('/pro/dashboard');
            else if (userData.role === 'job_seeker') navigate('/tasker/dashboard');
            else navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || "Reactivation failed.");
        } finally {
            setReactivating(false);
        }
    };

    const on2FASubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await verify2FALogin(userIdFor2FA, twoFactorCode);
            if (userData.role === 'employer') navigate('/pro/dashboard');
            else if (userData.role === 'job_seeker') navigate('/tasker/dashboard');
            else navigate('/');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Invalid 2FA Code';
            alert(msg);
        }
    };

    
     const handleGoogleAuth = () => {
        alert("Google Auth integration would go here. (Placeholder)");
    };
    

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                    {!requires2FA && (
                    <>
                    <button
                        onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
                        type="button"
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                        </div>
                    </div>
                    </>
                    )}
                </div>

                {requiresReactivation && !requires2FA && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                        <p className="text-sm text-blue-800 mb-3">
                            Your account is currently deactivated. Would you like to reactivate it?
                        </p>
                        <button
                            onClick={handleReactivate}
                            disabled={reactivating}
                            className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {reactivating ? 'Reactivating...' : 'Yes, Reactivate My Account'}
                        </button>
                        <button 
                            onClick={() => setRequiresReactivation(false)}
                            className="mt-2 text-xs text-gray-500 hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {requires2FA ? (
                    <form className="mt-8 space-y-6" onSubmit={on2FASubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <input
                                name="twoFactorCode"
                                type="text"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center tracking-widest text-lg"
                                placeholder="6-digit Authenticator Code"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Verify Code & Sign In
                            </button>
                        </div>
                        <div className="text-center mt-2">
                             <button type="button" onClick={() => setRequires2FA(false)} className="text-sm text-blue-600 hover:text-blue-500">Back to Login</button>
                        </div>
                    </form>
                ) : (
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={onChange}
                                autoComplete="email"
                                id="email"
                            />
                        </div>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={onChange}
                                autoComplete="current-password"
                                id="password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
                )}

                <div className="text-center">
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                        Forgot your password?
                    </Link>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
