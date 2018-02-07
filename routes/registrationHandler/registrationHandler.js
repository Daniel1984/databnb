const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const sendEmail = require('../../services/mailgun');
const { apiUrl } = require('../../config');

const router = express.Router();

function emailVerificationRequest({ to, url }) {
  sendEmail({
    to,
    subject: 'Please verify your email',
    html: `
      Please verify your email by clicking this link <a href="${url}" target="_blank">${url}</a>
    `,
  });
}

router.post('/', async (req, res, nex) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(403).json({ err: 'All fields required' });
  }

  if (password.length < 6) {
    return res.status(404).json({ err: 'Password must contain at least 6 characters' });
  }

  const persistedUser = await User.findOne({ email });
  if (persistedUser) {
    return res.status(403).json({ err: `User with ${persistedUser.email} email address is already registered.`});
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  try {
    const user = await User.create({ email, password: hashedPassword });
    emailVerificationRequest({ to: user.email, url: `${apiUrl}/confirm-user/${user._id}` });
    res.status(200).json({ msg: 'OK' });
  } catch (error) {
    res.status(500).json({ err: error.errors.email.message });
  }
});

module.exports = router;
