const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const user = new User({ username, password, role });
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// get
router.get('/getUser', async (req, res) => {
  try{
    const user = await User.find()

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user)
  }
  catch(error){
    res.status(400).json({error:error.message})
  }
})

// get by Id
router.get('/getUserById/:userId', async (req, res) => {
  try{
    const {userId} = req.params;
    const user = await User.findById({_id:userId})

    if (!user) {
      return res.status(404).json({ error: 'User not found by Id' });
    }
    res.json(user)
  }
  catch(error){
    res.status(400).json({error:error.message})
  }
})

module.exports = router;