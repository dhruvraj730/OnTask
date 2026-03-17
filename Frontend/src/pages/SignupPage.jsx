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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Create Your Account</h2>

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
