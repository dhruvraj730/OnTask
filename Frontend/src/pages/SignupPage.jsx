import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const SignupPage = () => {
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role') || 'job_seeker';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: roleParam
    });
    const { name, email, password, role } = formData;

    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/');
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
            const userData = await register(name, email, password, role);
            if (userData.role === 'employer') navigate('/pro/dashboard');
            else if (userData.role === 'job_seeker') navigate('/tasker/dashboard');
            else navigate('/');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Registration Failed';
            alert(msg);
        }
    };

    const handleGoogleAuth = () => {
        alert("Google Auth integration would go here. (Placeholder)");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join OnTask today
                    </p>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                    <button
                        onClick={handleGoogleAuth}
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
                </div>

                <div className="flex justify-center space-x-4 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/signup/freelancer')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${role === 'job_seeker' ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        I want to Work (Freelancer)
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/signup/organizer')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${role === 'employer' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        I want to Hire (Employer)
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    {/*<div className="rounded-md shadow-sm -space-y-px mb-6">
                        <div>
                            <input
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Full Name"
                                value={name}
                                onChange={onChange}
                                autoComplete="name"
                                id="name"
                            />
                        </div>
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={onChange}
                                autoComplete="email"
                                id="email"
                            />
                        </div>
                        <div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={onChange}
                                autoComplete="new-password"
                                id="password"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Create Account
                        </button>
                        <Link
                            to="/"
                            className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            Later (Go to Home)
                        </Link>
                    </div>*/}
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
