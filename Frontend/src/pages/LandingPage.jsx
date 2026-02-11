import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { HeroSection } from '../components/HeroSection';
import { TopTalent } from '../components/TopTalent';
import { ChevronDown, ChevronUp, Briefcase, Building2, CheckCircle2, Users, Shield, Zap, Search, Code, Palette, Camera, Music, Video, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <main>
                {/* Hero / Introduction */}
                <HeroSection />

                {/* Split Dual Section Hub */}
                <section className="max-w-[1400px] mx-auto px-4 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Choose Your Path</h2>
                        <p className="text-xl text-gray-500">Whether you're looking to hire or looking to work, we've got you covered.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 min-h-[600px]">

                        {/* Organizer Side - BLUE Theme */}
                        <div className="group relative overflow-hidden rounded-[2.5rem] bg-[#0A1128] text-white transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative h-full p-12 flex flex-col justify-between z-10">
                                <div>
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-8 shadow-lg shadow-blue-500/30">
                                        <Building2 className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-4xl font-bold mb-6">I'm an Event Organizer</h2>
                                    <p className="text-lg text-blue-100/70 mb-8 max-w-md leading-relaxed">
                                        Looking for elite talent to power your next project?
                                        Post opportunities, manage applications, and hire the best in the industry.
                                    </p>
                                    <ul className="space-y-4 mb-10">
                                        {['Access verified professionals', 'AI-powered job posting', 'Secure escrow payments', 'Dedicated campaign management'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-blue-100/60">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link to="/signup?role=employer" className="block">
                                    <button className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group-hover:gap-4 shadow-xl shadow-blue-600/20">
                                        Join as Organizer <ArrowRight className="w-6 h-6" />
                                    </button>
                                </Link>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                        </div>

                        {/* Tasker Side - EMERALD Theme */}
                        <div className="group relative overflow-hidden rounded-[2.5rem] bg-[#051F13] text-white transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative h-full p-12 flex flex-col justify-between z-10">
                                <div>
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 mb-8 shadow-lg shadow-emerald-500/30">
                                        <Briefcase className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-4xl font-bold mb-6">I'm a Tasker</h2>
                                    <p className="text-lg text-emerald-100/70 mb-8 max-w-md leading-relaxed">
                                        Ready to showcase your skills and earn?
                                        Browse high-impact shifts, build your professional profile, and grow your career.
                                    </p>
                                    <ul className="space-y-4 mb-10">
                                        {['Browse premium opportunities', 'Instant earnings tracking', 'Global work identity profile', 'Flexible shift scheduling'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-emerald-100/60">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link to="/signup?role=job_seeker" className="block">
                                    <button className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group-hover:gap-4 shadow-xl shadow-emerald-600/20">
                                        Join as Tasker <ArrowRight className="w-6 h-6" />
                                    </button>
                                </Link>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                        </div>

                    </div>
                </section>

                <TopTalent />

                {/* Additional Trust Section */}
                <section className="bg-gray-50 py-20 border-t border-gray-100">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-12 text-center">
                            <div>
                                <h4 className="text-4xl font-extrabold text-gray-900 mb-2">10k+</h4>
                                <p className="text-gray-500 font-medium">Verified Talent</p>
                            </div>
                            <div>
                                <h4 className="text-4xl font-extrabold text-gray-900 mb-2">₹50Cr+</h4>
                                <p className="text-gray-500 font-medium">Earned by Taskers</p>
                            </div>
                            <div>
                                <h4 className="text-4xl font-extrabold text-gray-900 mb-2">99.9%</h4>
                                <p className="text-gray-500 font-medium">Job Satisfaction</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
