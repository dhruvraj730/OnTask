import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Bot, PenTool, ArrowRight } from 'lucide-react';

const JobPostPage = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('manual'); // 'manual' or 'ai'
    const [loading, setLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState({ role: '', details: '' });

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        salary: '',
        description: '',
        startDate: '',
        durationValue: '',
        durationUnit: 'days',
        screeningQuestions: ['']
    });

    const { title, company, location, description, salary, startDate, durationValue, durationUnit, screeningQuestions } = formData;

    // AI Generation Logic (Simulated with Extraction)
    const handleAiGenerate = async () => {
        if (!aiPrompt.role) return alert("Please enter a role to generate for.");

        setLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            // Intelligent Extraction Logic (Simulated)
            const details = aiPrompt.details.toLowerCase();

            // 1. Extract Salary (looking for $ or 'k')
            let extractedSalary = 'Competitive';
            let numericBudget = 0;
            const moneyMatch = aiPrompt.details.match(/(₹[\d,]+(\.\d{2})?(\/hr|\/yr)?)|(\$[\d,]+(\.\d{2})?(\/hr|\/yr)?)|(\d+k)/i);
            if (moneyMatch) {
                extractedSalary = moneyMatch[0].replaceAll('$', '₹');
                const numericMatch = extractedSalary.replace(/,/g, '').match(/\d+/);
                if (numericMatch) numericBudget = Number(numericMatch[0]);
            }

            // 2. Extract Location (looking for 'in [City]')
            let extractedLocation = 'Remote';
            const locationMatch = details.match(/in\s+([a-zA-Z\s]+?)(?=\s|$|\.|,)/);
            if (locationMatch && locationMatch[1].toLowerCase() !== 'details') {
                // Simple cleanup to avoid grabbing common words
                extractedLocation = locationMatch[1].replace(/\b\w/g, l => l.toUpperCase()).trim();
            }

            // 3. Generate Description
            const generatedDescription = `We are searching for a skilled ${aiPrompt.role}.
            
About the Role:
We need someone who can handle: ${aiPrompt.details || 'standard industry tasks'}. 
 
Requirements:
- Proven experience as a ${aiPrompt.role}.
- Dedication to quality results.
- Ability to work ${extractedLocation === 'Remote' ? 'remotely' : `on-site in ${extractedLocation}`}.
 
Compensation:
- ${extractedSalary}
${aiPrompt.details.includes('urgent') ? '- Immediate Start Available!' : ''}`;

            setFormData({
                ...formData,
                title: `${aiPrompt.role}`,
                location: extractedLocation,
                salary: extractedSalary,
                budget: numericBudget,
                description: generatedDescription,
                startDate: new Date().toISOString().split('T')[0], // Default to today
                durationValue: '1',
                durationUnit: 'days',
                screeningQuestions: [
                    `Do you have experience as a ${aiPrompt.role}?`,
                    `Are you comfortable working for ${extractedSalary}?`,
                    `Can you commit to working in ${extractedLocation}?`
                ]
            });
            setLoading(false);
            setMode('manual'); // Switch to manual review
        }, 1500);
    };

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...screeningQuestions];
        newQuestions[index] = value;
        setFormData({ ...formData, screeningQuestions: newQuestions });
    };

    const addQuestion = () => {
        setFormData({ ...formData, screeningQuestions: [...screeningQuestions, ''] });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const validQuestions = screeningQuestions.filter(q => q.trim() !== '');
            const payload = {
                ...formData,
                screeningQuestions: validQuestions,
                duration: {
                    value: Number(durationValue),
                    unit: durationUnit
                }
            };
            await axios.post('/api/jobs', payload);
            navigate('/pro/dashboard');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                alert("Your session has expired. Please log in again.");
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                alert("You need an active subscription to post jobs!");
                navigate('/pricing');
            } else {
                console.error(err);
                alert(err.response?.data?.message || 'Failed to post job');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Post a New Project</h1>
                    <p className="text-gray-500 text-lg">Find the perfect talent for your event or business.</p>
                </div>

                {/* Mode Selection */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                        <button
                            onClick={() => setMode('manual')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${mode === 'manual' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <PenTool className="w-4 h-4" />
                            Manual Post
                        </button>
                        <button
                            onClick={() => setMode('ai')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${mode === 'ai' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Sparkles className="w-4 h-4" />
                            AI Job Poster
                        </button>
                    </div>
                </div>

                {/* AI View */}
                {mode === 'ai' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center p-3 bg-green-100 text-green-600 rounded-xl mb-4">
                                <Bot className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Let AI Write It For You</h2>
                            <p className="text-gray-500">Just tell us who you need, and we'll craft the perfect job description instantly.</p>
                        </div>

                        <div className="space-y-6 max-w-lg mx-auto">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">What role are you hiring for?</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Wedding Photographer, React Developer"
                                    className="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 bg-gray-50"
                                    value={aiPrompt.role}
                                    onChange={(e) => setAiPrompt({ ...aiPrompt, role: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Details (Salary, Location, Specifics?)</label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g. Need someone in Mumbai for ₹80k. Must know photography."
                                    className="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 bg-gray-50"
                                    value={aiPrompt.details}
                                    onChange={(e) => setAiPrompt({ ...aiPrompt, details: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleAiGenerate}
                                disabled={loading}
                                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>Generating Magic... <Sparkles className="animate-spin w-5 h-5" /></>
                                ) : (
                                    <>Generate Job Post <Sparkles className="w-5 h-5" /></>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Manual Form View */}
                {mode === 'manual' && (
                    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Job Title</label>
                                    <input type="text" name="title" required value={title} onChange={onChange} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Senior Event Planner" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                                    <input type="text" name="company" required value={company} onChange={onChange} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Your Company" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                                    <input type="text" name="location" required value={location} onChange={onChange} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. New York, Remote" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Salary Text</label>
                                        <input type="text" name="salary" required value={salary} onChange={onChange} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. ₹500/hr" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Numeric Budget (₹)</label>
                                        <input type="number" name="budget" value={formData.budget || ''} onChange={onChange} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Total (e.g. 5000)" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Starting Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        required
                                        value={startDate}
                                        onChange={onChange}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Work Duration</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            name="durationValue"
                                            required
                                            value={durationValue}
                                            onChange={onChange}
                                            className="block w-2/3 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Duration"
                                            min="1"
                                        />
                                        <select
                                            name="durationUnit"
                                            value={durationUnit}
                                            onChange={onChange}
                                            className="block w-1/3 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="hours">Hours</option>
                                            <option value="days">Days</option>
                                            <option value="weeks">Weeks</option>
                                            <option value="months">Months</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Job Description</label>
                                <textarea name="description" rows={8} required value={description} onChange={onChange} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Detailed description of the role..."></textarea>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-4">Screening Questions (Optional)</label>
                                {screeningQuestions.map((q, idx) => (
                                    <div key={idx} className="mb-3 flex items-center gap-2">
                                        <span className="text-gray-400 font-bold text-sm">Q{idx + 1}</span>
                                        <input
                                            type="text"
                                            value={q}
                                            onChange={(e) => handleQuestionChange(idx, e.target.value)}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder={`Ask a question...`}
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="mt-2 text-sm text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1"
                                >
                                    + Add Another Question
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-end">
                            <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-transform transform hover:-translate-y-0.5 flex items-center gap-2">
                                Post Job Now <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default JobPostPage;
