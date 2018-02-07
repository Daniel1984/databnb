const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const sendEmail = require('../../services/mailgun');
const { apiUrl } = require('../../config');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(404).json({ err: 'Email is required field' });
  }

  const persistedUser = await User.findOne({ email });

  if (!persistedUser) {
    return res.status(404).json({ err: 'User not found' });
  }
});

module.exports = router;
