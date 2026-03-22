import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const FeedbackModal = ({ isOpen, onClose, freelancerId, jobId, freelancerName, onFeedbackSubmitted }) => {
    const [freelancerRating, setFreelancerRating] = useState(0);
    const [freelancerHoverRating, setFreelancerHoverRating] = useState(0);
    const [freelancerComment, setFreelancerComment] = useState('');
    
    const [appRating, setAppRating] = useState(0);
    const [appHoverRating, setAppHoverRating] = useState(0);
    const [appFeedback, setAppFeedback] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (freelancerRating === 0) {
            toast.error('Please provide a rating for the freelancer.');
            return;
        }

        if (appRating === 0) {
            toast.error('Please provide a rating for the application.');
            return;
        }

        if (!freelancerComment.trim() || !appFeedback.trim()) {
            toast.error('Please provide feedback text for both sections.');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Submit Freelancer Review
            await axios.post('/api/reviews', {
                freelancerId,
                jobId,
                rating: freelancerRating,
                comment: freelancerComment
            }, config);

            // Submit App Feedback
            await axios.post('/api/app-feedback', {
                rating: appRating,
                feedback: appFeedback
            }, config);

            toast.success('Thank you for your feedback!');
            if (onFeedbackSubmitted) {
                onFeedbackSubmitted();
            }
            onClose();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = ({ rating, hoverRating, setRating, setHoverRating }) => {
        return (
            <div className="flex space-x-1">
                {[...Array(5)].map((star, index) => {
                    index += 1;
                    return (
                        <button
                            type="button"
                            key={index}
                            className={`${index <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"} focus:outline-none`}
                            onClick={() => setRating(index)}
                            onMouseEnter={() => setHoverRating(index)}
                            onMouseLeave={() => setHoverRating(rating)}
                        >
                            <Star className={`w-8 h-8 ${index <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300"} transition-all`} />
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Leave Feedback</h2>
                                <p className="text-sm text-gray-500 mt-1">Your feedback helps us and our taskers improve.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="feedback-form" onSubmit={handleSubmit} className="space-y-8">
                                
                                {/* Freelancer Feedback Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Rate {freelancerName}'s Work</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                        <StarRating 
                                            rating={freelancerRating} 
                                            hoverRating={freelancerHoverRating} 
                                            setRating={setFreelancerRating} 
                                            setHoverRating={setFreelancerHoverRating} 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Feedback for Tasker</label>
                                        <textarea
                                            value={freelancerComment}
                                            onChange={(e) => setFreelancerComment(e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-sm text-black placeholder-gray-400"
                                            placeholder={`Describe your experience working with ${freelancerName}...`}
                                            required
                                        ></textarea>
                                    </div>
                                </div>

                                {/* App Feedback Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Rate OnTask Application</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                        <StarRating 
                                            rating={appRating} 
                                            hoverRating={appHoverRating} 
                                            setRating={setAppRating} 
                                            setHoverRating={setAppHoverRating} 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Feedback for OnTask</label>
                                        <textarea
                                            value={appFeedback}
                                            onChange={(e) => setAppFeedback(e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-sm text-black placeholder-gray-400"
                                            placeholder="How was your experience using our platform? Any suggestions?"
                                            required
                                        ></textarea>
                                    </div>
                                </div>

                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 sticky bottom-0 z-10">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="feedback-form"
                                disabled={isSubmitting || freelancerRating === 0 || appRating === 0 || !freelancerComment.trim() || !appFeedback.trim()}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Feedback'
                                )}
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackModal;
