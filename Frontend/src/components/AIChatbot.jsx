import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';

const AIChatbot = () => {
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    // Watch for query param changes to open the bot and clean the URL
    useEffect(() => {
        if (searchParams.get('chat') === 'open') {
            setIsOpen(true);
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('chat');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Dynamic initial message based on role
    useEffect(() => {
        let welcomeText = "Hi! I'm OnTask AI. I can help you find jobs, find talent, or post projects instantly. Try typing 'Find jobs' or 'I need a bartender'.";
        
        if (user) {
            if (user.role === 'job_seeker') {
                welcomeText = `Hi ${user.name}! I'm OnTask AI. Ready for your next shift? I can help you find the perfect job or track your applications. Try typing 'Find driver jobs' or 'Check my status'.`;
            } else if (user.role === 'organizer' || user.role === 'employer') {
                welcomeText = `Hi ${user.name}! I'm OnTask AI. Looking for top talent? I can help you post a new job or search for experts. Try typing 'I need a waiter' or 'Search for developers'.`;
            }
        }
        
        setMessages([{ id: 1, text: welcomeText, sender: 'bot' }]);
    }, [user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI "Thinking"
        setTimeout(() => {
            const botResponse = processCommand(input.toLowerCase());
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse.text, sender: 'bot' }]);

            if (botResponse.action) {
                botResponse.action();
            }
        }, 800);
    };

    const processCommand = (text) => {
        // Simple Keyword Matching AI (Rule-Based)
        const isSeeker = user?.role === 'job_seeker';
        const isProvider = user?.role === 'organizer' || user?.role === 'employer';

        // 1. Post a Job Intent (Provider focus)
        if (text.includes('post') || text.includes('hire') || text.includes('need a')) {
            if (isSeeker) {
                return { text: "It looks like you're looking to hire! As a Job Seeker, you normally apply to jobs. Would you like to see available jobs instead?", action: () => navigate('/find-jobs') };
            }
            return {
                text: "I can help you post that job! Taking you to the job creation page now...",
                action: () => navigate('/pro/job/create')
            };
        }

        // 2. Search Jobs Intent
        if (text.includes('find job') || text.includes('looking for work') || text.includes('shifts') || text.includes('work')) {
            return {
                text: "Searching for current job openings for you...",
                action: () => navigate('/find-jobs')
            };
        }

        // 3. Search Talent Intent (Provider focus)
        if (text.includes('find talent') || text.includes('find worker') || text.includes('search staff') || text.includes('search talent')) {
            if (isSeeker) {
                return { text: "As a Job Seeker, you are our talent! Would you like to find jobs where you can use your skills?", action: () => navigate('/find-jobs') };
            }
            return {
                text: "Let me show you our top rated talent...",
                action: () => navigate('/find-talent')
            };
        }

        // 4. Specific Job/Talent Search
        if (text.includes('driver') || text.includes('waiter') || text.includes('bartender') || text.includes('developer')) {
            const query = text.match(/driver|waiter|bartender|developer/g)[0];
            if (isProvider) {
                return {
                    text: `Searching for ${query}s to join your team...`,
                    action: () => navigate(`/find-talent?skill=${query}`)
                };
            }
            return {
                text: `Looking for ${query} positions...`,
                action: () => navigate(`/find-jobs?title=${query}`)
            };
        }

        // Default
        const suggestions = isSeeker ? "'Find jobs', 'My applications'" : isProvider ? "'Post a job', 'Search talent'" : "'Find work', 'Hire experts'";
        return {
            text: `I didn't quite catch that. Try commands like ${suggestions}.`,
            action: null
        };
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 overflow-hidden border border-gray-100 flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">✨</span>
                                <h3 className="font-bold">OnTask AI</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask AI..."
                                className="flex-1 p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                                onClick={handleSend}
                                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                ➤
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="h-14 w-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30 text-white"
            >
                {isOpen ? '✕' : '✨'}
            </motion.button>
        </div>
    );
};

export default AIChatbot;
