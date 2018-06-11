const express = require('express');
const User = require('../../models/user');
const verifyToken = require('../../middleware/verifyToken');

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, { activeAccount: false });

    if (!user) {
      return res.status(404).json({ err: 'user not found' });
    }

    res.status(200).json({ msg: 'OK' });
  } catch (error) {
    res.status(500).json({ err: 'server error', error });
  }
});

module.exports = router;
