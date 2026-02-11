import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Send, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function JobFinderChatbot() {
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hi! I'm your OnTask Assistant. What kind of talent or work are you looking for today?" }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput("");

        // Simple AI simulation logic
        setTimeout(() => {
            let response = { role: 'bot', content: "I can help with that." };

            const lowerInput = userMsg.toLowerCase();

            if (lowerInput.includes('hire') || lowerInput.includes('talent') || lowerInput.includes('need')) {
                response.content = "I can help you find top talent. Redirecting you to our talent search...";
                setTimeout(() => navigate('/find-talent'), 1500);
            } else if (lowerInput.includes('job') || lowerInput.includes('work') || lowerInput.includes('shift')) {
                response.content = "Let's find you a gig! Taking you to job search...";
                setTimeout(() => navigate('/find-jobs'), 1500);
            } else {
                response.content = "Try asking 'I need a designer' or 'Find me driving jobs'.";
            }

            setMessages(prev => [...prev, response]);
        }, 800);
    };

    return (
        <Card className="w-full h-[500px] flex flex-col shadow-xl border-blue-100 bg-white/95 backdrop-blur">
            <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <Bot size={18} />
                </div>
                <span className="font-bold text-gray-800">OnTask AI</span>
            </div>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${m.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-3 border-t flex gap-2">
                <Input
                    className="flex-1"
                    placeholder="Ask something..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button size="icon" onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}
