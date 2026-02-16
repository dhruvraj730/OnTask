
import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const MultiStepProgressBar = ({ step, totalSteps }) => {
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
        </div>
    );
};

const FreelancerSignup = () => {
    const { register, updateProfile, user } = useContext(AuthContext);
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

        // Step 2: Professional
        professionalTitle: '',
        hourlyRate: '',
        bio: '',

        // Step 3: Skills
        skills: [],

        // Step 4: Bank
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        routingNumber: ''
    });

    const [customSkill, setCustomSkill] = useState('');

    // Predefined Skills List
    const skillOptions = [
        "Web Development", "Mobile Development", "UI/UX Design", "Graphic Design",
        "Content Writing", "Data Entry", "Video Editing", "Digital Marketing",
        "SEO", "Virtual Assistant", "Copywriting", "Project Management"
    ];

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSkillToggle = (skill) => {
        setFormData(prevState => {
            const skills = prevState.skills.includes(skill)
                ? prevState.skills.filter(s => s !== skill)
                : [...prevState.skills, skill];
            return { ...prevState, skills };
        });
    };

    const addCustomSkill = (e) => {
        e.preventDefault();
        if (customSkill && !formData.skills.includes(customSkill)) {
            setFormData(prevState => ({
                ...prevState,
                skills: [...prevState.skills, customSkill]
            }));
            setCustomSkill('');
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
            // Register as 'job_seeker' (Tasker)
            await register(formData.name, formData.email, formData.password, 'job_seeker', '');
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
            if (!formData.professionalTitle || !formData.hourlyRate || !formData.bio) {
                alert("Please fill all fields");
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
                professionalTitle: formData.professionalTitle,
                hourlyRate: formData.hourlyRate,
                bio: formData.bio,
                skills: formData.skills,
                bankDetails: {
                    accountHolderName: formData.accountHolderName,
                    bankName: formData.bankName,
                    accountNumber: formData.accountNumber,
                    routingNumber: formData.routingNumber
                }
            };
            await updateProfile(profileData);
            navigate('/tasker/dashboard');
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
            // Submit without bank details for now
            const profileData = {
                professionalTitle: formData.professionalTitle,
                hourlyRate: formData.hourlyRate,
                bio: formData.bio,
                skills: formData.skills,
            };
            await updateProfile(profileData);
            navigate('/tasker/dashboard');
        } catch (error) {
            console.error(error);
            navigate('/tasker/dashboard'); // Proceed anyway if error is minor, or handle
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-green-600">OnTask</h2>
                    <p className="mt-2 text-lg text-gray-700 font-semibold">
                        Join as Freelancer - Step {step} of {totalSteps}
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
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-blue-50/50"
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
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-blue-50/50"
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
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-blue-50/50"
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
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-blue-50/50"
                                value={formData.confirmPassword}
                                onChange={onChange}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 uppercase tracking-wider font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                            {loading ? 'Creating Account...' : 'Next'}
                        </button>
                        <div className="text-center mt-4 text-sm text-gray-600">
                            Already have an account? <Link to="/login" className="text-green-600 font-semibold hover:underline">Login here</Link>
                        </div>
                    </form>
                )}

                {/* Step 2: Professional Details */}
                {step === 2 && (
                    <form onSubmit={handleNext} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Professional Title</label>
                            <input
                                name="professionalTitle"
                                type="text"
                                placeholder="e.g. UI/UX Designer"
                                required
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                value={formData.professionalTitle}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Hourly Rate (₹)</label>
                            <input
                                name="hourlyRate"
                                type="number"
                                placeholder="500"
                                required
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                value={formData.hourlyRate}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Bio</label>
                            <textarea
                                name="bio"
                                rows="4"
                                placeholder="Describe your experience..."
                                required
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                value={formData.bio}
                                onChange={onChange}
                            ></textarea>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')} // Can't go back to step 1 easily as user is created, maybe redirect to home or stay
                                className="w-1/3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-2/3 py-3 px-4 rounded-lg text-white font-bold bg-green-600 hover:bg-green-700 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Skills */}
                {step === 3 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Select Your Skills</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            {skillOptions.map((skill) => (
                                <div key={skill} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={skill}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        checked={formData.skills.includes(skill)}
                                        onChange={() => handleSkillToggle(skill)}
                                    />
                                    <label htmlFor={skill} className="ml-2 text-sm text-gray-700">{skill}</label>
                                </div>
                            ))}
                        </div>

                        <label className="block text-sm font-bold text-gray-700 mb-2">Add Other Skills (not listed above)</label>
                        <form onSubmit={addCustomSkill} className="flex gap-2 mb-8">
                            <input
                                type="text"
                                placeholder="Type a skill and press Enter"
                                value={customSkill}
                                onChange={(e) => setCustomSkill(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
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
                                className="w-2/3 py-3 px-4 rounded-lg text-white font-bold bg-green-600 hover:bg-green-700 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Bank Details */}
                {step === 4 && (
                    <form onSubmit={handleFinalSubmit} className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Complete Your Profile</h3>
                            <p className="text-sm text-gray-500">Add your bank details to receive payments. You can update this later.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700">Account Holder Name</label>
                            <input
                                name="accountHolderName"
                                type="text"
                                placeholder="Your full name"
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-gray-50"
                                value={formData.accountHolderName}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Bank Name</label>
                            <input
                                name="bankName"
                                type="text"
                                placeholder="e.g., HDFC, SBI, ICICI"
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-gray-50"
                                value={formData.bankName}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Account Number</label>
                            <input
                                name="accountNumber"
                                type="password"
                                placeholder="••••••••••••"
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-gray-50"
                                value={formData.accountNumber}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Routing Number</label>
                            <input
                                name="routingNumber"
                                type="password"
                                placeholder="•••••••••"
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-gray-50"
                                value={formData.routingNumber}
                                onChange={onChange}
                            />
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
                                className="w-1/2 py-3 px-4 rounded-lg text-white font-bold bg-green-600 hover:bg-green-700 transition-colors"
                            >
                                {loading ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FreelancerSignup;
