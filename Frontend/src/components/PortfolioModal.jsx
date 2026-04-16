import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Link as LinkIcon, Image as ImageIcon, Briefcase, Zap } from 'lucide-react';

const PortfolioModal = ({ isOpen, onClose, onSave, loading }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [projectUrl, setProjectUrl] = useState('');
    const [skills, setSkills] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            title,
            description,
            imageFile,
            projectUrl,
            skills: skills.split(',').map(s => s.trim()).filter(s => s !== '')
        });
        // Clear form
        setTitle('');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
        setProjectUrl('');
        setSkills('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                                Add Portfolio Project
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Showcase your best work to get noticed by clients.</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all shadow-sm">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto">
                        <form id="portfolio-form" onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Project Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Modern E-commerce Website"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly explain what you built and your role..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 transition-all resize-none"
                                />
                            </div>

                            {/* Image Upload with Preview */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Project Screenshot</label>
                                <div className="flex gap-4 items-center">
                                    <div className="relative group w-32 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-2">Select a project screenshot (JPG, PNG or WebP).</p>
                                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm">
                                            <Plus className="w-3 h-3" /> {imageFile ? 'Change Image' : 'Choose File'}
                                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-gray-400" /> Project Link (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={projectUrl}
                                    onChange={(e) => setProjectUrl(e.target.value)}
                                    placeholder="https://github.com/..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-500" /> Skills Used (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    placeholder="e.g. React, Node.js, Tailwind, MongoDB"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 transition-all"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="portfolio-form"
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[150px]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Saving...
                                </span>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Add Project
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PortfolioModal;
