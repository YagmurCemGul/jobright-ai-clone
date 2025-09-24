const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/profile/skills
// @desc    Add a skill to user's profile
// @access  Private
router.post('/skills', auth, async (req, res) => {
  const { name, level } = req.body;

  if (!name) {
    return res.status(400).json({ msg: 'Skill name is required' });
  }

  try {
    const user = await User.findById(req.user.id);

    // Check if skill already exists
    const skillExists = user.skills.some(skill => skill.name.toLowerCase() === name.toLowerCase());
    if (skillExists) {
      return res.status(400).json({ msg: 'Skill already exists' });
    }

    const newSkill = { name, level: level || 'Belirtilmedi' };
    user.skills.unshift(newSkill); // Add to the beginning of the array

    await user.save();
    res.json(user.skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/profile/skills/:skill_id
// @desc    Delete a skill from profile
// @access  Private
router.delete('/skills/:skill_id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Filter out the skill to be deleted
    user.skills = user.skills.filter(skill => skill.id !== req.params.skill_id);

    await user.save();
    res.json(user.skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/skills/:skill_id
// @desc    Update a skill's level
// @access  Private
router.put('/skills/:skill_id', auth, async (req, res) => {
  const { level } = req.body;

  if (!level) {
    return res.status(400).json({ msg: 'Level is required' });
  }

  try {
    const user = await User.findById(req.user.id);

    const skill = user.skills.id(req.params.skill_id);
    if (!skill) {
      return res.status(404).json({ msg: 'Skill not found' });
    }

    skill.level = level;

    await user.save();
    res.json(user.skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;