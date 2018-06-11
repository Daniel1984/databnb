const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');

const router = express.Router();

router.post('/', async (req, res) => {
  const { password, token } = req.body;

  if (!password || password.length < 6) {
    return res.status(404).json({ err: 'Password is required. Must contain at least 6 characters' });
  }

  if (!token) {
    return res.status(404).json({ err: 'Malformed token, please try resetting your password again' });
  }

  jwt.verify(
    token,
    process.env.TOKEN_KEY,
    async (err, { email }) => {
      if (err) {
        return res.status(500).send({ err: 'Expired token, please try resetting your password again' });
      }

      const persistedUser = await User.findOne({ email });
      if (!persistedUser) {
        return res.status(404).json({ err: 'Something went wrong, please try resetting your password again' });
      }

      const hashedPassword = bcrypt.hashSync(password, 8);
      await User.findOneAndUpdate({ email }, { password: hashedPassword });
      res.status(200).json({ email });
    }
  );
});

module.exports = router;
