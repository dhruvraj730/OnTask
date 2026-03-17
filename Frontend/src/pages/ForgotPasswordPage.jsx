import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage(response.data.message);
            setError('');
            // Navigate to verify OTP page with email
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
            setMessage('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Forgot Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email address to receive a password reset OTP
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div>
                        <input
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Send OTP
                        </button>
                    </div>
                </form>

                {message && <p className="text-green-600 text-center">{message}</p>}
                {error && <p className="text-red-600 text-center">{error}</p>}

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Remember your password?{' '}
                        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;