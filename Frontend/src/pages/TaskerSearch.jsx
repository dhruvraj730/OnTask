import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import GlassContainer from '../components/premium/GlassContainer';
import AnimatedCard from '../components/premium/AnimatedCard';

const TaskerSearch = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [filters, setFilters] = useState({
        title: '',
        location: '',
        minSalary: ''
    });

    const searchJobs = async () => {
        try {
            const params = new URLSearchParams(filters);
            const res = await axios.get(`/api/search/jobs?${params}`);
            setJobs(res.data);
        } catch (error) {
            console.error(error);
        }
    };


    useEffect(() => {
        searchJobs();
    }, []);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <GlassContainer className="p-8 mb-8">
                    <h1 className="text-3xl font-bold mb-6">Find Your Next Shift</h1>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            name="title"
                            placeholder="Job Title (e.g. Waiter)"
                            onChange={handleChange}
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input
                            name="location"
                            placeholder="Location (e.g. New York)"
                            onChange={handleChange}
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input
                            name="minSalary"
                            type="number"
                            placeholder="Min Salary"
                            onChange={handleChange}
                            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={searchJobs}
                            className="bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            Search Jobs
                        </button>
                    </div>
                </GlassContainer>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <AnimatedCard key={job._id}>
                            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                            <p className="text-blue-600 font-medium mb-2">{job.company}</p>
                            <div className="text-sm text-gray-500 mb-4 space-y-1">
                                <p>📍 {job.location}</p>
                                <p>💰 {job.salary?.includes('$') ? job.salary.replaceAll('$', '₹') : (job.salary?.includes('₹') ? job.salary : (job.salary ? `₹${job.salary}` : 'N/A'))}</p>
                                {(job.positionsRequired || 1) - (job.hires?.length || 0) > 0 && (
                                    <p className="text-green-600 font-bold text-xs uppercase pt-1">🔥 {Math.max(0, (job.positionsRequired || 1) - (job.hires?.length || 0))} Position(s) Left</p>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>
                            {user?.role === 'job_seeker' ? (
                                <Link to={`/project/${job._id}`} className="block w-full text-center py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors">
                                    View Details & Apply
                                </Link>
                            ) : !user ? (
                                <button className="w-full py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                                    Login to Apply
                                </button>
                            ) : (
                                <p className="text-xs text-center text-gray-400 italic">Job seekers only</p>
                            )}
                        </AnimatedCard>
                    ))}
                    {jobs.length === 0 && <p className="text-gray-500 col-span-full text-center">No jobs found matching your criteria.</p>}
                </div>
            </div>
        </div>
    );
};

export default TaskerSearch;
