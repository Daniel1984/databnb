const express = require('express');
const Neighborhood = require('../../models/neighborhood');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    await Neighborhood.findByIdAndUpdate(req.body._id, { listingsScrapedAt: Date.now() });
    res.status(200).json({ status: 'OK' });
  } catch (error) {
    res.status(500).json({ err: 'server error', error });
  }
});

module.exports = router;
