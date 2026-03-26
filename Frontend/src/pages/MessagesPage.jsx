import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import GlassContainer from '../components/premium/GlassContainer';
import { useLocation } from 'react-router-dom';

const MessagesPage = () => {
    const { user, socket } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Check for userId passed via state (from "Interview" button)
    const location = useLocation();
    const initialChatUserId = location.state?.recipientId || location.state?.userId;

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

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
        }
    }, [currentChat]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMsg) => {
            if (currentChat && (newMsg.sender._id === currentChat._id || newMsg.sender === currentChat._id)) {
                setMessages(prev => [...prev, newMsg]);
                markAsRead(currentChat._id);
            }
            fetchConversations();
        };

        socket.on('newMessage', handleNewMessage);

        return () => socket.off('newMessage', handleNewMessage);
    }, [socket, currentChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/messages/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!user) return;
            const myId = user._id || user.id;
            const filteredConversations = res.data.filter(c => c._id.toString() !== myId.toString());
            console.log("Conversations with unread counts:", filteredConversations);
            setConversations(filteredConversations);

            // If checking for initial chat user who is NOT in list yet
            const targetId = initialChatUserId?.toString();
            if (targetId && targetId !== myId.toString() && !filteredConversations.find(c => c._id.toString() === targetId)) {
                setCurrentChat({ _id: initialChatUserId, name: location.state?.recipientName || location.state?.userName || 'New Chat' });
            } else if (targetId && filteredConversations.find(c => c._id.toString() === targetId)) {
                // If it exists now, use the real object
                setCurrentChat(filteredConversations.find(c => c._id.toString() === targetId));
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
            const hasUnread = res.data.some(m => !m.read && (m.recipient === (user?._id || user?.id) || m.recipient?._id === (user?._id || user?.id)));
            if (hasUnread) {
                await markAsRead(userId);
                fetchConversations();
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
                alert("Failed to send message: " + (error.response?.data?.message || error.message));
            }
        }
    };

    if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading chat...</div>;

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
                                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shrink-0 shadow-sm relative">
                                    {c.name.charAt(0).toUpperCase()}
                                    {c.unreadCount > 0 && (
                                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold truncate ${c.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {c.name}
                                        </h3>
                                        {c.unreadCount > 0 && (
                                            <div className="w-5 h-5 bg-blue-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-sm">
                                                {c.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center mt-0.5">
                                        <p className="text-xs text-gray-500 capitalize truncate">
                                            {c.role === 'employer' ? 'Provider' : c.role?.replace('_', ' ')}
                                        </p>
                                        {c.lastMessageAt && (
                                            <p className="text-[10px] text-gray-400">
                                                {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}
                                    </div>
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
