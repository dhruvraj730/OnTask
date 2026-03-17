import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyOtpPage = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resendMessage, setResendMessage] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        try {
            const response = await axios.post(`http://localhost:5000/api/auth/verify-otp/${email}`, { otp: otpValue });
            setMessage(response.data.message);
            setError('');
            // Navigate to reset password page
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
            setMessage('');
        }
    };

    const handleResend = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setResendMessage('OTP resent successfully');
            setTimeout(() => setResendMessage(''), 3000);
        } catch (err) {
            setResendMessage('Failed to resend OTP');
            setTimeout(() => setResendMessage(''), 3000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verify OTP
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter the 6-digit OTP sent to your email
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                className="w-12 h-12 text-2xl text-center border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={digit}
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length > 0) {
                                        const newOtp = [...otp];
                                        newOtp[idx] = val;
                                        setOtp(newOtp);
                                        // Move to next box
                                        if (idx < 5) {
                                            document.getElementById(`otp-box-${idx+1}`).focus();
                                        }
                                    } else {
                                        const newOtp = [...otp];
                                        newOtp[idx] = '';
                                        setOtp(newOtp);
                                    }
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Backspace' && otp[idx] === '' && idx > 0) {
                                        document.getElementById(`otp-box-${idx-1}`).focus();
                                    }
                                }}
                                id={`otp-box-${idx}`}
                                autoFocus={idx === 0}
                            />
                        ))}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Verify OTP
                        </button>
                    </div>
                </form>

                {message && <p className="text-green-600 text-center">{message}</p>}
                {error && <p className="text-red-600 text-center">{error}</p>}
                {resendMessage && <p className="text-blue-600 text-center">{resendMessage}</p>}

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Didn't receive OTP?{' '}
                        <button type="button" onClick={handleResend} className="font-medium text-blue-600 hover:text-blue-500">
                            Resend
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtpPage;