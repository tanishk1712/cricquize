const express = require('express');
const Question = require('../models/Question');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get random question for quiz
router.get('/question', auth, async (req, res) => {
  try {
    const count = await Question.countDocuments();
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne().skip(random);
    
    // Remove correct answer information before sending to user
    const sanitizedQuestion = {
      _id: question._id,
      question: question.question,
      options: question.options.map(opt => ({ _id: opt._id, text: opt.text }))
    };
    
    res.json(sanitizedQuestion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Submit answer
router.post('/answer', auth, async (req, res) => {
  try {
    const { questionId, optionId } = req.body;
    const question = await Question.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const selectedOption = question.options.id(optionId);
    const isCorrect = selectedOption.isCorrect;
    
    if (isCorrect) {
      await User.findByIdAndUpdate(req.user.userId, { $inc: { score: 1 } });
    }
    
    res.json({ 
      correct: isCorrect,
      message: isCorrect ? 'Correct answer!' : 'Wrong answer!'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user score
router.get('/score', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({ score: user.score });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;