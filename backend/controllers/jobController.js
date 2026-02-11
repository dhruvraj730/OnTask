const Job = require('../models/Job');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('employer', 'name company');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Not authorized as an employer' });
        }

        const { title, company, location, description, salary } = req.body;

        if (!title || !description || !company || !location || !salary) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const job = await Job.create({
            employer: req.user.id,
            title,
            company,
            location,
            description,
            salary
        });

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get my jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer only)
const getMyJobs = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Not authorized as an employer' });
        }

        const jobs = await Job.find({ employer: req.user.id })
            .populate('hiredTasker', 'name email skills hourlyRate')
            .populate('applications.applicant', 'name email skills hourlyRate');

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('employer', 'name email company')
            .populate('applications.applicant', 'name email skills hourlyRate bio assessmentScore');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Schedule an interview
// @route   PUT /api/jobs/:id/interview
// @access  Private (Employer only)
const scheduleInterview = async (req, res) => {
    try {
        const { applicantId, interviewLink, interviewDate } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const application = job.applications.find(app => app.applicant.toString() === applicantId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.interviewLink = interviewLink;
        application.interviewDate = interviewDate;
        application.interviewStatus = 'scheduled';
        application.status = 'interviewing';

        await job.save();
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Hire an applicant
// @route   PUT /api/jobs/:id/hire
// @access  Private (Employer only)
const hireApplicant = async (req, res) => {
    try {
        const { applicantId } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const application = job.applications.find(app => app.applicant.toString() === applicantId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = 'hired';
        job.hiredTasker = applicantId;
        job.jobStatus = 'in_progress'; // Status is now in_progress when someone is hired

        await job.save();
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Add progress update to a job
// @route   POST /api/jobs/:id/update
// @access  Private (Hired Tasker only)
const addJobUpdate = async (req, res) => {
    try {
        const { description, imageUrl } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (!job.hiredTasker || job.hiredTasker.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the hired tasker can post updates' });
        }

        job.progressUpdates.push({
            description,
            imageUrl: imageUrl || '',
            date: new Date()
        });

        await job.save();
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getJobs,
    createJob,
    getMyJobs,
    getJobById,
    scheduleInterview,
    hireApplicant,
    addJobUpdate
}
