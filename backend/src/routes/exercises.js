const express = require('express');
const Exercise = require('../models/Exercise');
const axios = require('axios');
const router = express.Router();

// Generate exercise
router.post('/generate', async (req, res) => {
  try {
    const { topic, subject, difficulty = 'medium', numberOfQuestions = 5 } = req.body;

    // Forward to Python AI agent
    const aiResponse = await axios.post(`${process.env.PYTHON_AI_URL || 'http://localhost:8000'}/generate-exercise`, {
      topic,
      subject,
      difficulty,
      numberOfQuestions,
      userId: req.user._id
    });

    // Save exercise to database
    const exercise = new Exercise({
      ...aiResponse.data,
      userId: req.user._id
    });

    await exercise.save();

    res.json(exercise);
  } catch (error) {
    console.error('Exercise generation error:', error);
    res.status(500).json({ 
      message: 'Error generating exercise',
      error: error.message 
    });
  }
});

// Get user exercises
router.get('/', async (req, res) => {
  try {
    const exercises = await Exercise.find({ userId: req.user._id })
      .select('title description subject difficulty createdAt')
      .sort({ createdAt: -1 });

    res.json({ exercises });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get exercise by ID
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json({ exercise });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;