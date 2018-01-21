const express = require('express');
const router = express.Router();

router.get('/', (req, res, nex) => {
  res.type('text/plain').send(`User-agent: *
Allow: /`);
});

module.exports = router;
