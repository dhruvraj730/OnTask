import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Loader2, IndianRupee } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const TipModal = ({ isOpen, onClose, onSkip, freelancerName, jobId, hireId, user, onTipSuccess }) => {
    const [tipAmount, setTipAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Preset tip amounts
    const presets = [50, 100, 200, 500];

    if (!isOpen) return null;

    const handleTip = async () => {
        const amount = Number(tipAmount);
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid tip amount');
            return;
        }

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // 1. Create Order
            const orderRes = await axios.post('/api/payment/tip/order', {
                jobId,
                hireId,
                amount
            }, config);
            
            const order = orderRes.data;

            // 2. Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SVrt70P33NYYWU',
                amount: order.amount,
                currency: order.currency,
                name: "OnTask Tip",
                description: `Tip for ${freelancerName}`,
                order_id: order.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await axios.post('/api/payment/tip/verify', {
                            ...response,
                            jobId,
                            hireId,
                            amount
                        }, config);

                        if (verifyRes.data.success) {
                            toast.success(`You sent a ₹${amount} tip to ${freelancerName}!`);
                            setTipAmount('');
                            if (onTipSuccess) onTipSuccess();
                        }
                    } catch (err) {
                        toast.error('Failed to verify tip payment');
                        console.error(err);
                    } finally {
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: function() {
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                },
                theme: {
                    color: "#8b5cf6", // Indigo/Violet theme for tipping
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            
        } catch (error) {
            console.error('Error initiating tip:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate tip payment');
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
                    >
                        {/* Header Background */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-violet-500 to-fuchsia-600 z-0 opacity-10"></div>
                        
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
                                    <Gift className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Send a Tip?</h3>
                                    <p className="text-sm font-medium text-gray-500 mt-1">Reward <span className="text-violet-600 font-bold">{freelancerName}</span> for stellar work!</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-4 gap-2">
                                    {presets.map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => setTipAmount(amount.toString())}
                                            className={`py-3 rounded-xl font-bold flex items-center justify-center transition-all ${
                                                tipAmount === amount.toString()
                                                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20 border-violet-600'
                                                    : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-violet-300 hover:bg-violet-50'
                                            }`}
                                        >
                                            ₹{amount}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Custom Amount</label>
                                    <div className="relative flex items-center">
                                        <IndianRupee className="w-5 h-5 text-gray-400 absolute left-4" />
                                        <input
                                            type="number"
                                            value={tipAmount}
                                            onChange={(e) => setTipAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-bold text-lg text-gray-900 transition-all border-l-4 border-l-violet-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-3">
                                <button
                                    onClick={handleTip}
                                    disabled={isProcessing || !tipAmount || Number(tipAmount) <= 0}
                                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>Send ₹{tipAmount || '0'} Tip</>
                                    )}
                                </button>
                                
                                <button
                                    onClick={onSkip}
                                    disabled={isProcessing}
                                    className="w-full py-3 text-gray-500 font-bold hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
                                >
                                    No thanks, skip to review
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TipModal;
