const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(403).json({ err: 'All fields required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ token: null });
    }

    if (!user.confirmedEmail) {
      return res.status(403).json({ err: 'You must first confirm your email address' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ token: null });
    }

    const token = jwt.sign(
      { id: user._id },
      '4e04432ac8f5f37fd91aecce7c3a989de5f46ba847a2157cd527c50c5d83ebaf',
      { expiresIn: 86400 } // expires in 24 hours
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send({ err: 'server error' });
  }
});

module.exports = router;
