const express = require('express');
const Listing = require('../../models/listing');
const verifyToken = require('../../middleware/verifyToken');

const router = express.Router();

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const listings = await Listing.find({ user_id: req.userId });
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ err: 'server error', error });
  }
});

router.get('/:listingId', verifyToken, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ err: 'server error', error });
  }
});

router.post('/', verifyToken, async (req, res, next) => {
  try  {
    res.status(200).json({});
  } catch (error) {
    res.status(400).json({ err: true, error });
  }
});

module.exports = router;
