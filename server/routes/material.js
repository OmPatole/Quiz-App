const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Material = require('../models/Material');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'material-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDFs are allowed'));
        }
    }
});

// @route   POST /api/material/upload
// @desc    Upload study material
// @access  Admin only
router.post('/upload', auth, roleAuth('Admin'), upload.single('file'), async (req, res) => {
    try {
        const { title, folderName } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        if (!title || !folderName) {
            return res.status(400).json({ message: 'Title and Folder Name are required' });
        }

        const material = new Material({
            title,
            folderName,
            fileUrl: `/uploads/${req.file.filename}`
        });

        await material.save();
        res.status(201).json(material);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/material
// @desc    Get all study materials
// @access  Students and Admin
router.get('/', auth, async (req, res) => {
    try {
        const materials = await Material.find().sort({ folderName: 1, title: 1 });
        res.json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/material/folders
// @desc    Get list of folders
// @access  Students and Admin
router.get('/folders', auth, async (req, res) => {
    try {
        const folders = await Material.distinct('folderName');
        res.json(folders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/material/:id
// @desc    Delete study material
// @access  Admin only
router.delete('/:id', auth, roleAuth('Admin'), async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Try to delete file from filesystem
        const fs = require('fs');
        const filePath = path.join(__dirname, '..', material.fileUrl);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await material.deleteOne();
        res.json({ message: 'Material removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
