import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import GlassContainer from '../components/premium/GlassContainer';
import AnimatedCard from '../components/premium/AnimatedCard';

const PricingPage = () => {
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            price: '₹999',
            period: '/month',
            features: ['5 Job Posts per month', 'Basic Support', 'Standard Profile']
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '₹1999',
            period: '/month',
            popular: true,
            features: ['Unlimited Job Posts', 'Priority Support', 'Verified Badge', 'Featured Listings']
        },
        {
            id: 'elite',
            name: 'Elite',
            price: '₹4999',
            period: '/month',
            features: ['All Pro Features', 'Dedicated Account Manager', 'AI-Powered Recruitment', 'Top of Search Results']
        }
    ];

    const handleSubscribe = async (planId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Please log in to subscribe.");
                navigate('/login');
                return;
            }

            const res = await axios.post('/api/payment/subscribe',
                { plan: planId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local user context
            const updatedUser = { ...user, subscription: res.data.subscription };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist

            alert(`Successfully subscribed to ${planId.toUpperCase()} plan!`);
            navigate(-1); // Go back to where they came from (Post Job or Apply)
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || 'Payment failed. Please try again.';
            alert(`Payment failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
                    Upgrade Your Experience
                </h2>
                <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-12">
                    Choose the plan that fits your needs. Cancel anytime.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <AnimatedCard key={plan.id} className={`relative flex flex-col ${plan.popular ? 'border-2 border-blue-500 transform scale-105 z-10' : ''}`}>
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                            <div className="text-5xl font-extrabold text-blue-600 mb-2">
                                {plan.price}
                                <span className="text-lg font-medium text-gray-500">{plan.period}</span>
                            </div>
                            <ul className="flex-1 mt-6 mb-8 space-y-4 text-left">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center text-gray-600">
                                        <span className="text-green-500 mr-2">✓</span> {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${plan.popular
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                                    : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                                    }`}
                            >
                                {loading ? 'Processing...' : `Subscribe to ${plan.name}`}
                            </button>
                        </AnimatedCard>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
