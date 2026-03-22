import { useState } from 'react';
import axios from 'axios';
import { Send, X } from 'lucide-react';

const PaymentModal = ({ job, hire, isOpen, onClose, onSuccess }) => {
    const [payType, setPayType] = useState('partial');
    const token = localStorage.getItem('token');

    if (!isOpen || !hire) return null;

    const budget = hire.agreedBudget || 0;
    const paid = hire.paidAmount || 0;
    const progress = hire.progress || 0;

    const verifiedWorkValue = Math.round((progress / 100) * budget);
    const partialAmount = Math.max(0, verifiedWorkValue - paid);
    const fullAmount = Math.max(0, budget - paid);
    const currentAmount = payType === 'partial' ? partialAmount : fullAmount;

    const handleReleasePayment = async () => {
        try {
            const freelancerId = hire.freelancer._id || hire.freelancer;
            const res = await axios.put(`/api/jobs/${job._id}/pay`, { type: payType, freelancerId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`${payType === 'full' ? 'Full' : 'Partial'} payment of ₹${currentAmount} released successfully!`);
            if (onSuccess) onSuccess(res.data.job, payType === 'full');
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Error releasing payment");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-left">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                        <Send className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Release Payment</h3>
                </div>

                <div className="space-y-4 mb-8">
                    <p className="text-sm text-gray-500 font-bold mb-2">For Freelancer: {hire.freelancer.name}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Contract Budget</p>
                            <p className="font-bold text-gray-900 font-mono text-lg">₹{budget}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Already Paid</p>
                            <p className="font-bold text-blue-600 font-mono text-lg">₹{paid}</p>
                        </div>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setPayType('partial')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${payType === 'partial' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Partial Payment
                        </button>
                        <button
                            onClick={() => setPayType('full')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${payType === 'full' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Full Payment
                        </button>
                    </div>

                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div className="space-y-2 mb-4 border-b border-emerald-100 pb-4">
                            <div className="flex justify-between text-xs">
                                <span className="text-emerald-600 font-medium">{progress}% Verified Work Value</span>
                                <span className="text-emerald-700 font-bold">₹{verifiedWorkValue}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-emerald-600 font-medium">Minus Previous Payments</span>
                                <span className="text-red-500 font-bold">-₹{paid}</span>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Net to Release Now</p>
                        <p className="text-4xl font-bold text-emerald-700 font-mono">₹{currentAmount}</p>
                        {payType === 'partial' && (
                            <p className="text-[10px] text-emerald-500 mt-2 font-bold uppercase tracking-tight">
                                Accurate to Organizer-Verified Progress
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReleasePayment}
                        disabled={currentAmount <= 0}
                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
