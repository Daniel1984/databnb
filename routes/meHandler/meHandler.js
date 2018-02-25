const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const verifyToken = require('../../middleware/verifyToken');

const router = express.Router();

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId, { password: 0, __v: 0 });

    if (!user) {
      return res.status(404).json({ err: 'user not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ err: 'server error', error });
  }
});

router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, { ...req.body }).select('-password -__v');

    if (!user) {
      return res.status(404).json({ err: 'user not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ err: true, error });
  }
});

module.exports = router;
