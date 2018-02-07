const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const sendEmail = require('../../services/mailgun');
const { apiUrl, clientUrl, tokenKey } = require('../../config');

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

  const token = jwt.sign({ email: persistedUser.email }, tokenKey, { expiresIn: 86400 });
  const resetPasswordUrl = `${clientUrl}/change-password?token=${token}`;

  sendEmail({
    to: persistedUser.email,
    subject: 'Password Reset',
    html: `
      You can change your password by clicking on this link <a href="${resetPasswordUrl}" target="_blank">${resetPasswordUrl}</a>
    `,
  });

  res.status(200).send({ msg: 'Please check your email for further instructions.' });
});

module.exports = router;
