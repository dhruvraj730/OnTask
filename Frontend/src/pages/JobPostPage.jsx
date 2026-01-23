import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const JobPostPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        salary: '',
        description: '',
        screeningQuestions: ['']
    });

    const { title, company, location, description, salary, screeningQuestions } = formData;

    const navigate = useNavigate();

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
            await axios.post('/api/jobs', formData);
            navigate('/pro/dashboard');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                alert("You need an active subscription to post jobs!");
                navigate('/pricing');
            } else {
                console.error(err);
                alert('Failed to post job');
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Post a New Job</h1>
            <form onSubmit={onSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input type="text" name="title" required onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input type="text" name="company" required onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input type="text" name="location" required onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Salary Range</label>
                    <input type="text" name="salary" required onChange={onChange} placeholder="e.g. $50k - $80k" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Screening Questions (Optional)</label>
                    <p className="text-xs text-gray-500 mb-2">Ask candidates specific questions to vet them before the interview.</p>
                    {screeningQuestions.map((q, idx) => (
                        <div key={idx} className="mb-2">
                            <input
                                type="text"
                                value={q}
                                onChange={(e) => handleQuestionChange(idx, e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder={`Question ${idx + 1}`}
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="text-sm text-blue-600 font-bold hover:text-blue-800"
                    >
                        + Add Question
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" rows={5} required onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                        Post Job
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobPostPage;
