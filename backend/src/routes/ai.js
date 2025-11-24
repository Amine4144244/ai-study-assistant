const express = require('express');
const axios = require('axios');
const PDF = require('../models/PDF');
const router = express.Router();

// Ask general question
router.post('/ask', async (req, res) => {
  try {
    const { question, language = 'darija' } = req.body;
    
    // Forward to Python AI agent
    const aiResponse = await axios.post(`${process.env.PYTHON_AI_URL || 'http://localhost:8000'}/ask`, {
      question,
      language,
      userId: req.user._id
    });

    res.json(aiResponse.data);
  } catch (error) {
    console.error('AI request error:', error);
    res.status(500).json({ 
      message: 'Error processing AI request',
      error: error.message 
    });
  }
});

// Ask about specific PDF
router.post('/pdf-query', async (req, res) => {
  try {
    const { question, pdfId, language = 'darija' } = req.body;

    // Get PDF content
    const pdf = await PDF.findOne({
      _id: pdfId,
      userId: req.user._id
    });

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Forward to Python AI agent
    const aiResponse = await axios.post(`${process.env.PYTHON_AI_URL || 'http://localhost:8000'}/ask-pdf`, {
      question,
      pdfContent: pdf.textContent,
      language,
      userId: req.user._id
    });

    res.json(aiResponse.data);
  } catch (error) {
    console.error('PDF AI request error:', error);
    res.status(500).json({ 
      message: 'Error processing PDF AI request',
      error: error.message 
    });
  }
});

// Summarize specific PDF
router.post('/summarize-pdf', async (req, res) => {
  try {
    const { pdfId, language = 'darija' } = req.body;

    // Get PDF content
    const pdf = await PDF.findOne({
      _id: pdfId,
      userId: req.user._id
    });

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Forward to Python AI agent's summarize endpoint
    const aiResponse = await axios.post(`${process.env.PYTHON_AI_URL || 'http://localhost:8000'}/summarize`, {
      question: "summarize", // Placeholder question as it's required by the Pydantic model
      pdfContent: pdf.textContent,
      language,
      userId: req.user._id
    });

    res.json(aiResponse.data);
  } catch (error) {
    console.error('PDF summarization AI request error:', error);
    res.status(500).json({ 
      message: 'Error processing PDF summarization AI request',
      error: error.message 
    });
  }
});

module.exports = router;