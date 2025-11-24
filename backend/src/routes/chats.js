const express = require('express');
const Chat = require('../models/Chat');
const router = express.Router();

// Get all chats for current user
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ lastMessageAt: -1 })
      .select('title lastMessageAt messages pdfId language createdAt')
      .limit(50);

    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific chat by ID
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('pdfId', 'originalName');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new chat
router.post('/', async (req, res) => {
  try {
    const { title, pdfId, language } = req.body;

    const chat = new Chat({
      userId: req.user._id,
      title: title || 'New Chat',
      pdfId: pdfId || null,
      language: language || 'darija',
      messages: []
    });

    await chat.save();

    res.status(201).json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add message to chat
router.post('/:id/messages', async (req, res) => {
  try {
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({ message: 'Role and content are required' });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    chat.lastMessageAt = new Date();

    // Auto-generate title from first user message if still "New Chat"
    if (chat.title === 'New Chat' && role === 'user' && chat.messages.length === 1) {
      chat.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }

    await chat.save();

    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update chat title
router.patch('/:id', async (req, res) => {
  try {
    const { title } = req.body;

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete chat
router.delete('/:id', async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
