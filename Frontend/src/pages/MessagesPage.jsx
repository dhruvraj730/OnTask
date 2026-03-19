import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import GlassContainer from '../components/premium/GlassContainer';
import { useLocation } from 'react-router-dom';

const MessagesPage = () => {
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Check for userId passed via state (from "Interview" button)
    const location = useLocation();
    const initialChatUserId = location.state?.recipientId || location.state?.userId;

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (initialChatUserId && conversations.length > 0) {
            const existingConv = conversations.find(c => c._id === initialChatUserId);
            if (existingConv) {
                setCurrentChat(existingConv);
            } else {
                // If no prior conversation, we need to fetch user details to start one. 
                // For now, assuming standard flow where we only chat if conversation exists or just created.
                // Ideally, fetch user details by ID if not in conversation list.
            }
        }
    }, [initialChatUserId, conversations]);

    useEffect(() => {
        if (currentChat) {
            fetchMessages(currentChat._id);
            const interval = setInterval(() => fetchMessages(currentChat._id), 3000); // Polling for sync
            return () => clearInterval(interval);
        }
    }, [currentChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/messages/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(res.data);

            // If checking for initial chat user who is NOT in list yet (new interview)
            if (initialChatUserId && !res.data.find(c => c._id === initialChatUserId)) {
                // Creating a "fake" conversation object to start chat
                // In production, fetch this user's data from an API
                setCurrentChat({ _id: initialChatUserId, name: location.state?.recipientName || location.state?.userName || 'New Chat' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const markAsRead = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/messages/${userId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/messages/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
            
            // Mark as read if there are unread messages for the current user
            const hasUnread = res.data.some(m => !m.read && (m.recipient === user._id || m.recipient?._id === user._id));
            if (hasUnread) {
                await markAsRead(userId);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentChat) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/messages',
                { recipientId: currentChat._id, content: newMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages([...messages, res.data]);
            setNewMessage('');
            if (!conversations.find(c => c._id === currentChat._id)) {
                fetchConversations(); // Refresh list if new conversation
            }
        } catch (error) {
            console.error(error);
            // Safety Check Alert
            if (error.response && error.response.status === 400 && error.response.data.message.includes('blocked')) {
                alert("⚠️ " + error.response.data.message);
            } else {
                alert("Failed to send message");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-6 pb-12 px-4 sm:px-6 lg:px-8 h-screen flex flex-col">
            <GlassContainer className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
                {/* Sidebar */}
                <div className="w-1/3 border-r border-gray-200 bg-white/50 flex flex-col">
                    <div className="p-4 border-b border-gray-200 font-bold text-lg text-gray-700">Messages</div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map(c => (
                            <div
                                key={c._id}
                                onClick={() => setCurrentChat(c)}
                                className={`p-4 flex items-center cursor-pointer hover:bg-blue-50 transition-colors ${currentChat?._id === c._id ? 'bg-blue-100' : ''}`}
                            >
                                <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                    {c.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{c.name}</h3>
                                    <p className="text-xs text-gray-500 capitalize">{c.role?.replace('_', ' ')}</p>
                                </div>
                            </div>
                        ))}
                        {conversations.length === 0 && <p className="p-4 text-gray-500 text-sm">No conversations yet.</p>}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white/30 relative">
                    {currentChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 bg-white/60 backdrop-blur-md flex items-center shadow-sm z-10">
                                <h2 className="font-bold text-lg text-gray-800">{currentChat.name || "Chat"}</h2>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender._id === user._id || msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${msg.sender._id === user._id || msg.sender === user._id
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-2 items-end">
                                <textarea
                                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none max-h-32 min-h-[48px]"
                                    placeholder="Type a message... (Shift+Enter for new line)"
                                    rows="1"
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        e.target.style.height = 'inherit';
                                        e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(e);
                                            e.target.style.height = 'inherit'; // reset height on send
                                        }
                                    }}
                                />
                                <button type="submit" className="h-[48px] px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shrink-0">
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Select a conversation to start messaging
                        </div>
                    )}
                </div>
            </GlassContainer>
        </div>
    );
};

export default MessagesPage;
