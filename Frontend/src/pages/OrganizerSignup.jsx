
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const MultiStepProgressBar = ({ step, totalSteps }) => {
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
        </div>
    );
};

const OrganizerSignup = () => {
    const { register, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const totalSteps = 4;
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        // Step 1: Account
        name: '',
        email: '',
        password: '',
        confirmPassword: '',

        // Step 2: Company Details
        companyName: '',
        industry: '',
        website: '',
        bio: '', // Company Bio

        // Step 3: Hiring Needs
        hiringNeeds: [],

        // Step 4: Business Address / Billing
        street: '',
        city: '',
        state: '',
        zip: '',
        taxId: ''
    });

    const [customNeed, setCustomNeed] = useState('');

    // Predefined Hiring Needs
    const needOptions = [
        "Bartenders", "Servers", "DJs", "Security Personnel",
        "Event Planners", "Photographers", "Videographers", "Decorators",
        "Catering Staff", "Cleaning Crew", "Valet Drivers", "Promoters"
    ];

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNeedToggle = (need) => {
        setFormData(prevState => {
            const hiringNeeds = prevState.hiringNeeds.includes(need)
                ? prevState.hiringNeeds.filter(n => n !== need)
                : [...prevState.hiringNeeds, need];
            return { ...prevState, hiringNeeds };
        });
    };

    const addCustomNeed = (e) => {
        e.preventDefault();
        if (customNeed && !formData.hiringNeeds.includes(customNeed)) {
            setFormData(prevState => ({
                ...prevState,
                hiringNeeds: [...prevState.hiringNeeds, customNeed]
            }));
            setCustomNeed('');
        }
    };

    // Step 1: Account Creation
    const handleAccountCreation = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (formData.password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            // Register as 'employer' (Organizer)
            await register(formData.name, formData.email, formData.password, 'employer');
            setStep(2);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    // Step 2, 3: Next
    const handleNext = (e) => {
        e.preventDefault();
        if (step === 2) {
            if (!formData.companyName || !formData.industry) {
                alert("Please fill required fields (Company Name, Industry)");
                return;
            }
        }
        setStep(step + 1);
    };

    // Step 4: Final Submission
    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const profileData = {
                companyName: formData.companyName,
                industry: formData.industry,
                website: formData.website,
                bio: formData.bio,
                hiringNeeds: formData.hiringNeeds,
                businessAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    taxId: formData.taxId
                }
            };
            await updateProfile(profileData);
            navigate('/pro/dashboard'); // Redirect to Employer Dashboard
        } catch (error) {
            console.error(error);
            alert("Failed to update profile. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleSkipStep4 = async () => {
        setLoading(true);
        try {
            const profileData = {
                companyName: formData.companyName,
                industry: formData.industry,
                website: formData.website,
                bio: formData.bio,
                hiringNeeds: formData.hiringNeeds,
            };
            await updateProfile(profileData);
            navigate('/pro/dashboard');
        } catch (error) {
            console.error(error);
            navigate('/pro/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-blue-600">OnTask</h2>
                    <p className="mt-2 text-lg text-gray-700 font-semibold">
                        Join as Provider- Step {step} of {totalSteps}
                    </p>
                </div>

                <MultiStepProgressBar step={step} totalSteps={totalSteps} />

                {/* Step 1: Account Info */}
                {step === 1 && (
                    <form onSubmit={handleAccountCreation} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-50/20"
                                value={formData.name}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-50/20"
                                value={formData.email}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength="6"
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-50/20"
                                value={formData.password}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength="6"
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-50/20"
                                value={formData.confirmPassword}
                                onChange={onChange}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 uppercase tracking-wider font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            {loading ? 'Creating Account...' : 'Next'}
                        </button>
                        <div className="text-center mt-4 text-sm text-gray-600">
                            Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login here</Link>
                        </div>
                    </form>
                )}

                {/* Step 2: Company Details */}
                {step === 2 && (
                    <form onSubmit={handleNext} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Company / Organization Name</label>
                            <input
                                name="companyName"
                                type="text"
                                placeholder="e.g. Acme Events"
                                required
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={formData.companyName}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Industry</label>
                            <input
                                name="industry"
                                type="text"
                                placeholder="e.g. Weddings, Corporate, Nightlife"
                                required
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={formData.industry}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Website (Optional)</label>
                            <input
                                name="website"
                                type="url"
                                placeholder="https://..."
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={formData.website}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Company Bio</label>
                            <textarea
                                name="bio"
                                rows="3"
                                placeholder="Tell freelancers about your company..."
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={formData.bio}
                                onChange={onChange}
                            ></textarea>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')} // Redirect to home or stay
                                className="w-1/3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-2/3 py-3 px-4 rounded-lg text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Hiring Needs */}
                {step === 3 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-4">What talent are you looking for?</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            {needOptions.map((need) => (
                                <div key={need} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={need}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={formData.hiringNeeds.includes(need)}
                                        onChange={() => handleNeedToggle(need)}
                                    />
                                    <label htmlFor={need} className="ml-2 text-sm text-gray-700">{need}</label>
                                </div>
                            ))}
                        </div>

                        <label className="block text-sm font-bold text-gray-700 mb-2">Add Other Roles</label>
                        <form onSubmit={addCustomNeed} className="flex gap-2 mb-8">
                            <input
                                type="text"
                                placeholder="Type a role and press Enter"
                                value={customNeed}
                                onChange={(e) => setCustomNeed(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </form>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-1/3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(4)}
                                className="w-2/3 py-3 px-4 rounded-lg text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Business Address / Verification */}
                {step === 4 && (
                    <form onSubmit={handleFinalSubmit} className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Verify Your Business</h3>
                            <p className="text-sm text-gray-500">Provide your business address for verification and invoicing.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700">Street Address</label>
                            <input
                                name="street"
                                type="text"
                                placeholder="123 Event Ave"
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                value={formData.street}
                                onChange={onChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">City</label>
                                <input
                                    name="city"
                                    type="text"
                                    placeholder="Mumbai"
                                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                    value={formData.city}
                                    onChange={onChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">State / Province</label>
                                <input
                                    name="state"
                                    type="text"
                                    placeholder="Maharashtra"
                                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                    value={formData.state}
                                    onChange={onChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">ZIP / User Code</label>
                                <input
                                    name="zip"
                                    type="text"
                                    placeholder="400001"
                                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                    value={formData.zip}
                                    onChange={onChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Tax ID (Optional)</label>
                                <input
                                    name="taxId"
                                    type="text"
                                    placeholder="XX-XXXXXXX"
                                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                    value={formData.taxId}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleSkipStep4}
                                className="w-1/2 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Skip for Now
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-1/2 py-3 px-4 rounded-lg text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                {loading ? 'Saving...' : 'Complete Profile'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default OrganizerSignup;
