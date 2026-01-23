import { useState, useEffect } from 'react';
import axios from 'axios';
import GlassContainer from '../components/premium/GlassContainer';
import AnimatedCard from '../components/premium/AnimatedCard';

const OrganizerTalentSearch = () => {
    const [taskers, setTaskers] = useState([]);
    const [filters, setFilters] = useState({
        skill: '',
        minRating: '',
        minExperience: ''
    });

    const searchTaskers = async () => {
        try {
            const params = new URLSearchParams(filters);
            const res = await axios.get(`http://localhost:5000/api/search/taskers?${params}`);
            setTaskers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        searchTaskers();
    }, []);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <GlassContainer className="p-8 mb-8">
                    <h1 className="text-3xl font-bold mb-6">Find Top Talent</h1>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            name="skill"
                            placeholder="Skill (e.g. Bartender)"
                            onChange={handleChange}
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <input
                            name="minRating"
                            type="number"
                            placeholder="Min Rating (1-5)"
                            onChange={handleChange}
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <input
                            name="minExperience"
                            type="number"
                            placeholder="Min Experience (Years)"
                            onChange={handleChange}
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <button
                            onClick={searchTaskers}
                            className="bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                        >
                            Search Talent
                        </button>
                    </div>
                </GlassContainer>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {taskers.map((tasker) => (
                        <AnimatedCard key={tasker._id} className="border-t-4 border-t-purple-500">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600 mr-4">
                                    {tasker.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{tasker.name}</h3>
                                    <div className="flex text-yellow-500 text-sm">
                                        {'⭐'.repeat(Math.round(tasker.rating || 0))}
                                        <span className="text-gray-400 ml-1">({tasker.experience || 0} yrs exp)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4">
                                {tasker.skills && tasker.skills.map((skill, idx) => (
                                    <span key={idx} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tasker.bio || "No bio available."}</p>
                            <button className="w-full py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition-colors">
                                View Profile
                            </button>
                        </AnimatedCard>
                    ))}
                    {taskers.length === 0 && <p className="text-gray-500 col-span-full text-center">No talent found matching your criteria.</p>}
                </div>
            </div>
        </div>
    );
};

export default OrganizerTalentSearch;
