import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const topTalent = [
    {
        name: "Sarah Jenkins",
        role: "Event Photographer",
        rating: 4.9,
        reviews: 124,
        hourlyRate: "$45/hr",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        skills: ["Photography", "Editing", "Events"]
    },
    {
        name: "David Chen",
        role: "Web Developer",
        rating: 5.0,
        reviews: 89,
        hourlyRate: "$60/hr",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        skills: ["React", "Node.js", "UI/UX"]
    },
    {
        name: "Maria Rodriguez",
        role: "Marketing Specialist",
        rating: 4.8,
        reviews: 215,
        hourlyRate: "$40/hr",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        skills: ["SEO", "Content", "Strategy"]
    },
    {
        name: "James Wilson",
        role: "Personal Driver",
        rating: 4.9,
        reviews: 310,
        hourlyRate: "$35/hr",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        skills: ["Driving", "Logistics", "Safe"]
    }
];

export function TopTalent() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">Highest Rated Talent</h2>
                        <p className="text-gray-500 text-lg">Work with the best. Vetted professionals ready to start.</p>
                    </div>
                    <Link to="/find-talent" className="hidden md:block">
                        <Button variant="outline" className="rounded-full">See All Talent</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topTalent.map((talent, idx) => (
                        <Card key={idx} className="card-hover border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <img
                                        src={talent.image}
                                        alt={talent.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                                    />
                                    <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                                        Available
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{talent.name}</h3>
                                <p className="text-blue-600 text-sm font-medium mb-3">{talent.role}</p>

                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <span className="text-yellow-400 mr-1">★</span>
                                    <span className="font-bold text-gray-900 mr-1">{talent.rating}</span>
                                    <span>({talent.reviews})</span>
                                    <span className="mx-2">•</span>
                                    <span>{talent.hourlyRate}</span>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {talent.skills.slice(0, 2).map(skill => (
                                        <span key={skill} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                                            {skill}
                                        </span>
                                    ))}
                                    <span className="px-2 py-1 bg-gray-50 text-gray-400 text-xs rounded-md">+1</span>
                                </div>

                                <Link to="/signup?role=employer" className="block">
                                    <Button className="w-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 font-bold">
                                        View Profile
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link to="/find-talent">
                        <Button variant="outline" className="rounded-full w-full">See All Talent</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
