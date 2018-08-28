const startOfYesterday = require('date-fns/start_of_yesterday');
const express = require('express');
const Listing = require('../../models/listing');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const listings = await Listing.where({
      $or: [
        { availability_checked_at: null },
        { where: { $lt: startOfYesterday() } },
      ],
    });

    res.status(200).json(listings.map(({ id }) => id));
  } catch (error) {
    res.status(500).json({ err: 'server error', error });
  }
});

module.exports = router;
