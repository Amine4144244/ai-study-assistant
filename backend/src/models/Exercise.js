const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [String],
    correctAnswer: {
      type: String,
      required: true
    },
    explanation: String
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  subject: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PDF'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exercise', exerciseSchema);