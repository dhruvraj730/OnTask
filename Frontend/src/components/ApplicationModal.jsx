import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ApplicationModal = ({ job, isOpen, onClose }) => {
    const [answers, setAnswers] = useState(
        job.screeningQuestions ? job.screeningQuestions.map(q => ({ question: q, answer: '' })) : []
    );
    const [submitting, setSubmitting] = useState(false);

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index].answer = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            // Logic to submit application (Need to create endpoint /api/jobs/:id/apply)
            // For now, let's assume endpoint exists or mock it
            // await axios.post(`http://localhost:5000/api/jobs/${job._id}/apply`, { answers }, { headers: { 'x-auth-token': token } });

            // Mock success
            setTimeout(() => {
                setSubmitting(false);
                onClose();
                alert("Application Submitted!");
            }, 1000);
        } catch (error) {
            console.error(error);
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl relative"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

                    <h2 className="text-2xl font-bold mb-2">Apply for {job.title}</h2>
                    <p className="text-gray-500 mb-6">{job.company}</p>

                    {job.screeningQuestions && job.screeningQuestions.length > 0 ? (
                        <div className="space-y-4 mb-6">
                            <p className="font-semibold text-gray-700">Please answer the following questions:</p>
                            {answers.map((item, idx) => (
                                <div key={idx}>
                                    <label className="block text-sm text-gray-600 mb-1">{item.question}</label>
                                    <textarea
                                        value={item.answer}
                                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows={2}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mb-6 text-gray-600">Are you sure you want to apply for this position?</p>
                    )}

                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={`px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors ${submitting ? 'opacity-75' : ''}`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Aplication'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ApplicationModal;
