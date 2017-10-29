const express = require('express');

const scrapeListings = require('../scripts/scrapeListings');
const City = require('../models/city');
const Listing = require('../models/listing');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const cities = await City.find();
    res.render('cities', { cities });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.get('/:cityId', async (req, res, next) => {
  try {
    const listings = await Listing.find({ city: req.params.cityId }, 'listingId listingUrl listingStartDate');
    res.status(200).json(listings);
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
