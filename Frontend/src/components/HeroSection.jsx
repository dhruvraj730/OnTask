import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

export function HeroSection() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        navigate(`/find-jobs?title=${encodeURIComponent(searchQuery)}`);
    };

    const handleCategoryClick = (category) => {
        navigate(`/find-jobs?title=${encodeURIComponent(category)}`);
    };

    return (
        <section className="relative bg-gradient-to-b from-blue-50/50 to-white py-16 md:py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            How work <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">should work</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-lg">
                            Forget the old rules. You can have the best people. Right now. Right here.
                        </p>
                        <div className="flex flex-col gap-4">
                            <form onSubmit={handleSearch} className="flex gap-2 max-w-md bg-white p-2 rounded-full shadow-lg border border-gray-100">
                                <Input
                                    placeholder="Search for skills, services..."
                                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-base py-3"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button type="submit" className="rounded-full px-6 h-12 bg-blue-600 hover:bg-blue-700">
                                    <Search className="w-5 h-5" />
                                </Button>
                            </form>
                            <div className="flex gap-3 flex-wrap mt-4">
                                <span className="text-sm text-gray-500 py-1">Popular:</span>
                                {['Web Design', 'React', 'Content Writing', 'Marketing'].map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleCategoryClick(tag)}
                                        className="text-sm border rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative hidden md:block">
                        <div className="absolute inset-0 bg-blue-200 rounded-full filter blur-[100px] opacity-30"></div>
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Team working"
                            className="relative z-10 rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
