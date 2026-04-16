import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Zap, Loader2, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AuthContext from '../context/AuthContext';

const DirectHireModal = ({ isOpen, onClose, freelancerId, freelancerName, onOfferSent }) => {
    const { token } = useContext(AuthContext);
    const [mode, setMode] = useState('existing'); // 'existing' or 'new'
    const [loading, setLoading] = useState(false);
    const [employerJobs, setEmployerJobs] = useState([]);
    const [fetchingJobs, setFetchingJobs] = useState(false);

    // Form states
    const [selectedJobId, setSelectedJobId] = useState('');
    const [offerBudget, setOfferBudget] = useState('');
    
    // New job fields
    const [newJobTitle, setNewJobTitle] = useState('');
    const [newJobDesc, setNewJobDesc] = useState('');
    const [newJobDate, setNewJobDate] = useState('');

    useEffect(() => {
        if (isOpen && mode === 'existing') {
            fetchEmployerJobs();
        }
    }, [isOpen, mode]);

    const fetchEmployerJobs = async () => {
        setFetchingJobs(true);
        try {
            const res = await axios.get('/api/jobs/my-jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const openJobs = res.data.filter(j => j.jobStatus === 'open' || j.jobStatus === 'in_progress');
            setEmployerJobs(openJobs);
        } catch (error) {
            console.error(error);
        } finally {
            setFetchingJobs(false);
        }
    };

    const handleSendOffer = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            mode,
            freelancerId,
            offerBudget: Number(offerBudget) || 0
        };

        if (mode === 'existing') {
            if (!selectedJobId) {
                toast.error('Please select an existing job.');
                setLoading(false);
                return;
            }
            payload.jobId = selectedJobId;
        } else {
            if (!newJobTitle || !newJobDesc || !newJobDate) {
                toast.error('Please fill in all details for the new contract.');
                setLoading(false);
                return;
            }
            payload.title = newJobTitle;
            payload.description = newJobDesc;
            payload.startDate = newJobDate;
        }

        try {
            await axios.post('/api/jobs/direct-hire', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Direct hire offer sent to ${freelancerName}!`);
            if (onOfferSent) onOfferSent();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send direct offer');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Hire {freelancerName}</h3>
                                <p className="text-sm text-gray-500 mt-1">Send a direct offer to seamlessly start working together.</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setMode('existing')}
                                className={`flex-1 py-4 font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-colors ${mode === 'existing' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            >
                                <Briefcase className="w-4 h-4" /> Invite to Existing Job
                            </button>
                            <button
                                onClick={() => setMode('new')}
                                className={`flex-1 py-4 font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-colors ${mode === 'new' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            >
                                <Zap className="w-4 h-4" /> New Direct Contract
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="direct-hire-form" onSubmit={handleSendOffer} className="space-y-5">
                                {mode === 'existing' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Job</label>
                                            {fetchingJobs ? (
                                                <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading jobs...
                                                </div>
                                            ) : employerJobs.length > 0 ? (
                                                <select
                                                    value={selectedJobId}
                                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 transition-all"
                                                    required
                                                >
                                                    <option value="">-- Choose an open job --</option>
                                                    {employerJobs.map(job => (
                                                        <option key={job._id} value={job._id}>{job.title} (₹{job.budget})</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="p-4 text-center text-orange-600 bg-orange-50 rounded-xl border border-orange-100 font-medium text-sm">
                                                    You don't have any open jobs to invite them to. Try creating a new direct contract!
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Contract Title</label>
                                            <input
                                                type="text"
                                                value={newJobTitle}
                                                onChange={(e) => setNewJobTitle(e.target.value)}
                                                placeholder="e.g. Private Barista for Wedding"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Description / Requirements</label>
                                            <textarea
                                                rows={3}
                                                value={newJobDesc}
                                                onChange={(e) => setNewJobDesc(e.target.value)}
                                                placeholder="Describe exactly what you need them to do..."
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 transition-all resize-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" /> Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={newJobDate}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setNewJobDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 transition-all"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="pt-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Offer Budget (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 font-bold text-gray-400">₹</span>
                                        <input
                                            type="number"
                                            value={offerBudget}
                                            onChange={(e) => setOfferBudget(e.target.value)}
                                            placeholder="Enter amount (e.g. 5000)"
                                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-bold text-lg text-emerald-700 transition-all shadow-sm"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-medium">This budget will be locked in the contract once accepted.</p>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="direct-hire-form"
                                disabled={loading || (mode === 'existing' && !selectedJobId)}
                                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[150px]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Offer'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DirectHireModal;
