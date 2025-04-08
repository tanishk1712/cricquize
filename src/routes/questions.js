const express = require('express');
const Question = require('../models/Question');
const { auth, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Add question (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { question, options } = req.body;
    const newQuestion = new Question({
      question,
      options,
      createdBy: req.user.userId
    });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all questions (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;