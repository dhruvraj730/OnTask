import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EarningsPage = () => {
    const { user, token } = useContext(AuthContext);
    const [walletData, setWalletData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const res = await axios.get('/api/wallet', config);
            setWalletData(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            setLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.post('/api/wallet/withdraw', { amount: withdrawAmount }, config);
            alert('Withdrawal request submitted successfully! Amount will be transferred to your registered bank account.');
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            fetchWalletData();
        } catch (error) {
            alert(error.response?.data?.message || 'Withdrawal failed');
        }
    };

    // Mock data for chart if not enough real data
    const chartData = [
        { name: 'Jan', amount: 1200 },
        { name: 'Feb', amount: 1900 },
        { name: 'Mar', amount: 1500 },
        { name: 'Apr', amount: 2200 },
        { name: 'May', amount: 2400 },
        { name: 'Jun', amount: 2400 },
    ];

    if (loading) return <div className="p-10 text-center">Loading wallet...</div>;

    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Earnings & Wallet</h1>
                <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-shadow shadow-md"
                >
                    Withdraw Funds
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium mb-1">Available Balance</p>
                    <h2 className="text-3xl font-bold text-green-600">{formatINR(walletData?.walletBalance || 0)}</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Earnings</p>
                    <h2 className="text-3xl font-bold text-gray-800">{formatINR(walletData?.totalEarnings || 0)}</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Withdrawn</p>
                    <h2 className="text-3xl font-bold text-gray-800">{formatINR(walletData?.totalWithdrawn || 0)}</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium mb-1">This Month</p>
                    <h2 className="text-3xl font-bold text-blue-600">{formatINR(2300)}</h2>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Earnings Trend (Last 6 Months)</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(value) => formatINR(value)} />
                            <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-700">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {walletData?.transactions && walletData.transactions.length > 0 ? (
                        walletData.transactions.slice().reverse().map((tx, idx) => (
                            <div key={idx} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                    <p className="font-bold text-gray-800">{tx.description}</p>
                                    <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${tx.type === 'withdrawal' ? 'text-gray-800' : 'text-green-600'}`}>
                                        {tx.type === 'withdrawal' ? '-' : '+'}{formatINR(tx.amount)}
                                    </p>
                                    <p className="text-xs text-gray-400 capitalize">{tx.status}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">No transactions found.</div>
                    )}
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl transform transition-all scale-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Withdraw Funds</h2>
                        <p className="text-gray-500 mb-6">Available Balance: <span className="text-green-600 font-bold">{formatINR(walletData?.walletBalance || 0)}</span></p>

                        <form onSubmit={handleWithdraw}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount (INR)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        placeholder="0"
                                        min="1"
                                        max={walletData?.walletBalance}
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Minimum withdrawal: ₹100</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
                                <strong>Target Account:</strong> Funds will be transferred to account ending in {user?.bankDetails?.accountNumber?.slice(-4) || '****'}, as per your profile.
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                                >
                                    Request Withdrawal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EarningsPage;
