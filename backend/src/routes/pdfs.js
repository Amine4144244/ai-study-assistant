const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const pdfParse = require('pdf-parse');
const PDF = require('../models/PDF');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage for multer to process file before uploading
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    // The file is in memory as a buffer
    const buffer = req.file.buffer;
    const pdfData = await pdfParse(buffer);

    // Upload the buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'taalim-ai/pdfs', 
          resource_type: 'raw' 
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Create PDF document
    const pdf = new PDF({
      filename: uploadResult.public_id,
      originalName: req.file.originalname,
      cloudinaryId: uploadResult.public_id,
      textContent: pdfData.text,
      wordCount: pdfData.text.split(/\s+/).length,
      pageCount: pdfData.numpages || 0,
      userId: req.user._id
    });

    await pdf.save();

    res.status(201).json({
      message: 'PDF uploaded successfully',
      pdf: {
        id: pdf._id,
        filename: pdf.filename,
        originalName: pdf.originalName,
        wordCount: pdf.wordCount,
        pageCount: pdf.pageCount,
        createdAt: pdf.createdAt
      }
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ message: 'Error uploading PDF', error: error.message });
  }
});

// Get user's PDFs
router.get('/', async (req, res) => {
  try {
    const pdfs = await PDF.find({ userId: req.user._id })
      .select('filename originalName wordCount pageCount createdAt')
      .sort({ createdAt: -1 });

    res.json({ pdfs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get PDF by ID
router.get('/:id', async (req, res) => {
  try {
    const pdf = await PDF.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('-textContent'); // Don't return full text content

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    res.json({ pdf });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete PDF
router.delete('/:id', async (req, res) => {
  try {
    const pdf = await PDF.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(pdf.cloudinaryId, { resource_type: 'raw' });

    // Delete from database
    await PDF.findByIdAndDelete(req.params.id);

    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;