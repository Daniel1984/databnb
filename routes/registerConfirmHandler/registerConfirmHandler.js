const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const { clientUrl } = require('../../config');

router.get('/', (req, res) => {
  res.status(404).send('Malformed url, please try again later');
});

router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(user_id, { confirmedEmail: true });
    res.redirect(`${clientUrl}/thank-you?email=${user.email}`);
  } catch (error) {
    res.status(404).send('Malformed url, please try again later');
  }
});

module.exports = router;
