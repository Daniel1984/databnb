const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');

const router = express.Router();

router.post('/', async (req, res, nex) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(403).json({ err: 'All fields required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log(hashedPassword)

  try {
    const user = await User.create({ email, password : hashedPassword });

    const token = jwt.sign(
      { id: user._id },
      '4e04432ac8f5f37fd91aecce7c3a989de5f46ba847a2157cd527c50c5d83ebaf',
      { expiresIn: 86400 } // expires in 24 hours
    );

    res.status(200).json({ auth: true, token });
  } catch (error) {
    res.status(500).json({ err: error.errors.email.message });
  }
});

module.exports = router;
