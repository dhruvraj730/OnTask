import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Sparkles, Bot, PenTool, ArrowRight, ArrowLeft, 
    CheckCircle2, Info, Calendar, Clock, Users, 
    DollarSign, MapPin, Building, Briefcase, Plus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const JobPostPage = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('manual'); // 'manual' or 'ai'
    const [step, setStep] = useState(1);
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
        positionsRequired: 1,
        budget: 0,
        screeningQuestions: ['']
    });

    const { title, company, location, description, salary, startDate, durationValue, durationUnit, positionsRequired, screeningQuestions } = formData;

    const steps = [
        { id: 1, title: 'Basic Info', icon: Info },
        { id: 2, title: 'Logistics', icon: Calendar },
        { id: 3, title: 'Budget', icon: DollarSign },
        { id: 4, title: 'Details', icon: Briefcase },
    ];

    // AI Generation Logic
    const handleAiGenerate = async () => {
        if (!aiPrompt.role) return toast.error("Please enter a role to generate for.");

        setLoading(true);
        setTimeout(() => {
            const details = aiPrompt.details.toLowerCase();

            let extractedSalary = 'Competitive';
            let numericBudget = 0;
            const moneyMatch = aiPrompt.details.match(/(₹[\d,]+(\.\d{2})?(\/hr|\/yr)?)|(\$[\d,]+(\.\d{2})?(\/hr|\/yr)?)|(\d+k)/i);
            if (moneyMatch) {
                extractedSalary = moneyMatch[0].replaceAll('$', '₹');
                const numericMatch = extractedSalary.replace(/,/g, '').match(/\d+/);
                if (numericMatch) numericBudget = Number(numericMatch[0]);
            }

            let extractedLocation = 'Remote';
            const locationMatch = details.match(/in\s+([a-zA-Z\s]+?)(?=\s|$|\.|,)/);
            if (locationMatch && locationMatch[1].toLowerCase() !== 'details') {
                extractedLocation = locationMatch[1].replace(/\b\w/g, l => l.toUpperCase()).trim();
            }

            let extractedPositions = 1;
            const posMatch = details.match(/(\d+)\s+(people|freelancers|developers|designers|photographers|workers|persons|taskers|guys|girls)/i) ||
                aiPrompt.role.match(/(\d+)\s+(people|freelancers|developers|designers|photographers|workers|persons|taskers|guys|girls)/i);
            if (posMatch) {
                extractedPositions = parseInt(posMatch[1], 10) || 1;
            }

            const generatedDescription = `We are searching for a skilled ${aiPrompt.role}.

### About the Role
We need someone who can handle: ${aiPrompt.details || 'standard industry tasks'}. 

### Requirements
- Proven experience as a ${aiPrompt.role}.
- Dedication to quality results.
- Ability to work ${extractedLocation === 'Remote' ? 'remotely' : `on-site in ${extractedLocation}`}.

### Compensation
- ${extractedSalary}
${aiPrompt.details.includes('urgent') ? '- Immediate Start Available!' : ''}`;

            setFormData({
                ...formData,
                title: `${aiPrompt.role}`,
                location: extractedLocation,
                salary: extractedSalary,
                budget: numericBudget,
                description: generatedDescription,
                startDate: new Date().toISOString().split('T')[0],
                durationValue: '1',
                durationUnit: 'days',
                positionsRequired: extractedPositions,
                screeningQuestions: [
                    `Do you have experience as a ${aiPrompt.role}?`,
                    `Are you comfortable working for ${extractedSalary}?`,
                    `Can you commit to working in ${extractedLocation}?`
                ]
            });
            setLoading(false);
            setMode('manual');
            setStep(1);
            toast.success("Job post generated! Review details below.");
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

    const nextStep = () => {
        if (step === 1 && (!title || !company || !location)) return toast.error("Please fill all required fields");
        if (step === 2 && (!startDate || !durationValue)) return toast.error("Please set the timeline");
        if (step === 3 && !salary) return toast.error("Please specified the compensation");
        setStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const validQuestions = screeningQuestions.filter(q => q.trim() !== '');
            const payload = {
                ...formData,
                screeningQuestions: validQuestions,
                positionsRequired: Number(positionsRequired),
                budget: Number(formData.budget) || 0,
                duration: {
                    value: Number(durationValue),
                    unit: durationUnit
                }
            };
            await axios.post('/api/jobs', payload);
            toast.success("Job posted successfully!");
            navigate('/pro/dashboard');
        } catch (err) {
            setLoading(false);
            if (err.response && err.response.status === 401) {
                toast.error("Session expired. Please login again.");
                navigate('/login');
            } else if (err.response && err.response.status === 403) {
                toast.error("Active subscription required to post jobs!");
                navigate('/pricing');
            } else {
                toast.error(err.response?.data?.message || 'Failed to post job');
            }
        }
    };

    const PreviewCard = () => (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-blue-600 uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                Live Preview
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{title || 'Job Title'}</h3>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                <Building className="w-3 h-3" /> {company || 'Your Company'} • <MapPin className="w-3 h-3 ml-2" /> {location || 'Location'}
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Compensation</p>
                    <p className="text-sm font-bold text-gray-700">{salary || '₹ —'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Positions</p>
                    <p className="text-sm font-bold text-gray-700">{positionsRequired} Open</p>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>Starts {startDate || 'TBD'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Duration: {durationValue || '—'} {durationUnit}</span>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-4 italic">
                    {description || 'No description provided yet...'}
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-500">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        {/* Header */}
                        <div className="mb-10 text-left">
                            <motion.h1 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-black text-slate-900 mb-3 tracking-tight"
                            >
                                Post a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">New Project</span>
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-500 text-lg font-medium"
                            >
                                Let's find the best talent for your needs.
                            </motion.p>
                        </div>

                        {/* Mode Selection */}
                        <div className="flex mb-8">
                            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex items-center">
                                <button
                                    onClick={() => setMode('manual')}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${mode === 'manual' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <PenTool className="w-4 h-4" />
                                    Manual Post
                                </button>
                                <button
                                    onClick={() => setMode('ai')}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${mode === 'ai' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    AI Magic
                                </button>
                            </div>
                        </div>

                        {/* Step Indicator */}
                        {mode === 'manual' && (
                            <div className="mb-8 flex items-center justify-between px-2">
                                {steps.map((s, idx) => (
                                    <div key={s.id} className="flex items-center flex-1 last:flex-none">
                                        <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setStep(s.id)}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step >= s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-300 border border-slate-200'}`}>
                                                {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-blue-600' : 'text-slate-400'}`}>{s.title}</span>
                                        </div>
                                        {idx < steps.length - 1 && (
                                            <div className="h-0.5 flex-1 mx-4 bg-slate-200 relative overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: step > s.id ? '100%' : '0%' }}
                                                    className="absolute top-0 left-0 h-full bg-blue-600"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* AI Mode View */}
                        <AnimatePresence mode="wait">
                            {mode === 'ai' && (
                                <motion.div
                                    key="ai-view"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-3xl shadow-2xl border border-indigo-50 p-10 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                                    <div className="text-center mb-10">
                                        <div className="inline-flex items-center justify-center p-4 bg-indigo-100 text-indigo-600 rounded-2xl mb-5 ring-8 ring-indigo-50">
                                            <Bot className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900 mb-2">AI Job Poster</h2>
                                        <p className="text-slate-500 font-medium">Briefly describe the role, and our AI will craft a professional post in seconds.</p>
                                    </div>

                                    <div className="space-y-6 max-w-md mx-auto">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Target Role</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Wedding Photographer, React Developer"
                                                className="block w-full px-5 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50 transition-all font-medium"
                                                value={aiPrompt.role}
                                                onChange={(e) => setAiPrompt({ ...aiPrompt, role: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">Key Specifics</label>
                                            <textarea
                                                rows={3}
                                                placeholder="Budget, Location, and specific requirements..."
                                                className="block w-full px-5 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50 transition-all font-medium"
                                                value={aiPrompt.details}
                                                onChange={(e) => setAiPrompt({ ...aiPrompt, details: e.target.value })}
                                            />
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleAiGenerate}
                                            disabled={loading}
                                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all flex justify-center items-center gap-3"
                                        >
                                            {loading ? (
                                                <>Casting Magic... <Sparkles className="animate-spin w-5 h-5 text-indigo-200" /></>
                                            ) : (
                                                <>Generate Professional Post <Sparkles className="w-5 h-5" /></>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Manual Steps */}
                            {mode === 'manual' && (
                                <form onSubmit={onSubmit}>
                                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
                                        <div className="p-8 flex-1">
                                            <AnimatePresence mode="wait">
                                                {step === 1 && (
                                                    <motion.div 
                                                        key="step1"
                                                        initial={{ x: 20, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        exit={{ x: -20, opacity: 0 }}
                                                        className="space-y-8"
                                                    >
                                                        <h3 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">Basic Information</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black text-slate-700 uppercase pl-1">Job Title</label>
                                                                <input type="text" name="title" required value={title} onChange={onChange} className="block w-full px-5 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 bg-slate-50 transition-all font-medium" placeholder="Senior Event Planner" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black text-slate-700 uppercase pl-1">Company Name</label>
                                                                <input type="text" name="company" required value={company} onChange={onChange} className="block w-full px-5 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 bg-slate-50 transition-all font-medium" placeholder="Global Events Corp" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black text-slate-700 uppercase pl-1">Work Location</label>
                                                            <div className="relative">
                                                                <MapPin className="absolute left-5 top-5 text-slate-400 w-5 h-5" />
                                                                <input type="text" name="location" required value={location} onChange={onChange} className="block w-full pl-14 pr-5 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 bg-slate-50 transition-all font-medium" placeholder="Mumbai, Remote, or Event Venue" />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {step === 2 && (
                                                    <motion.div 
                                                        key="step2"
                                                        initial={{ x: 20, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        exit={{ x: -20, opacity: 0 }}
                                                        className="space-y-8"
                                                    >
                                                        <h3 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">Logistics & Timeline</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black text-slate-700 uppercase pl-1">Starting Date</label>
                                                                <input type="date" name="startDate" required value={startDate} onChange={onChange} className="block w-full px-5 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 bg-slate-50 transition-all font-medium" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black text-slate-700 uppercase pl-1">Work Duration</label>
                                                                <div className="flex gap-4">
                                                                    <input type="number" name="durationValue" required value={durationValue} onChange={onChange} className="block w-3/5 px-5 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 bg-slate-50 transition-all font-medium" placeholder="4" min="1" />
                                                                    <select name="durationUnit" value={durationUnit} onChange={onChange} className="block w-2/5 px-4 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 bg-slate-50 transition-all font-bold">
                                                                        <option value="hours">Hours</option>
                                                                        <option value="days">Days</option>
                                                                        <option value="weeks">Weeks</option>
                                                                        <option value="months">Months</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black text-slate-700 uppercase pl-1">Positions Available</label>
                                                            <div className="relative">
                                                                <Users className="absolute left-5 top-5 text-slate-400 w-5 h-5" />
                                                                <input type="number" name="positionsRequired" required min="1" value={positionsRequired} onChange={onChange} className="block w-full pl-14 pr-5 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 bg-slate-50 transition-all font-medium" placeholder="Number of people needed" />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {step === 3 && (
                                                    <motion.div 
                                                        key="step3"
                                                        initial={{ x: 20, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        exit={{ x: -20, opacity: 0 }}
                                                        className="space-y-8"
                                                    >
                                                        <h3 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">Budget & Compensation</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="space-y-2 text-left">
                                                                <label className="text-xs font-black text-slate-700 uppercase pl-1">Salary / Rate Text</label>
                                                                <input type="text" name="salary" required value={salary} onChange={onChange} className="block w-full px-5 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 bg-slate-50 transition-all font-medium" placeholder="e.g. ₹500/hr or Negotiable" />
                                                            </div>
                                                            <div className="space-y-2 text-left">
                                                                <label className="text-xs font-black text-slate-700 uppercase pl-1">Total Budget (Numeric ₹)</label>
                                                                <div className="relative">
                                                                    <DollarSign className="absolute left-5 top-5 text-slate-400 w-5 h-5" />
                                                                    <input type="number" name="budget" value={formData.budget || ''} onChange={onChange} className="block w-full pl-14 pr-5 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 bg-slate-50 transition-all font-medium" placeholder="e.g. 10000" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4">
                                                            <div className="bg-amber-100 text-amber-600 p-2 rounded-xl self-start"><Info className="w-5 h-5" /></div>
                                                            <div>
                                                                <p className="text-sm font-bold text-amber-900 mb-1">Budget Allocation</p>
                                                                <p className="text-xs text-amber-800 leading-relaxed font-medium">The Numeric Budget is the total amount you are willing to pay for this project. This help taskers understand the project's scale.</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {step === 4 && (
                                                    <motion.div 
                                                        key="step4"
                                                        initial={{ x: 20, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        exit={{ x: -20, opacity: 0 }}
                                                        className="space-y-8"
                                                    >
                                                        <h3 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">The Nitty Gritty</h3>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-black text-slate-700 uppercase pl-1">Job Description</label>
                                                            <textarea name="description" rows={6} required value={description} onChange={onChange} className="block w-full px-5 py-4 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 bg-slate-50 transition-all font-medium" placeholder="What exactly needs to be done?"></textarea>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <label className="text-xs font-black text-slate-700 uppercase pl-1">Screening Questions (Dynamic)</label>
                                                            <div className="space-y-3">
                                                                {screeningQuestions.map((q, idx) => (
                                                                    <div key={idx} className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">{idx + 1}</div>
                                                                        <input
                                                                            type="text"
                                                                            value={q}
                                                                            onChange={(e) => handleQuestionChange(idx, e.target.value)}
                                                                            className="block flex-1 px-5 py-3 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-slate-50 transition-all text-sm font-medium"
                                                                            placeholder={`Ask a screening question...`}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={addQuestion}
                                                                className="ml-11 px-4 py-2 text-xs text-blue-600 font-black uppercase tracking-wider hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2"
                                                            >
                                                                <Plus className="w-4 h-4 text-blue-600" />
                                                                Add Question
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                            <button 
                                                type="button"
                                                onClick={prevStep}
                                                disabled={step === 1}
                                                className={`px-6 py-3 font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${step > 1 ? 'text-slate-600 hover:bg-white border border-slate-200' : 'text-slate-300 pointer-events-none'}`}
                                            >
                                                <ArrowLeft className="w-4 h-4" /> Back
                                            </button>

                                            {step < 4 ? (
                                                <button 
                                                    type="button"
                                                    onClick={nextStep}
                                                    className="px-8 py-3 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-blue-600 shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
                                                >
                                                    Continue <ArrowRight className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button 
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-8 py-3 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center gap-2"
                                                >
                                                    {loading ? 'Publishing...' : 'Publish Project'} <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Preview Sidebar */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="hidden lg:block"
                    >
                        <PreviewCard />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default JobPostPage;
