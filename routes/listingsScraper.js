const express = require('express');
const scrapeListings = require('../scripts/scrapeListings');
const City = require('../models/city');
const Listing = require('../models/listing');

const router = express.Router();

router.get('/scrape-listings', async (req, res, next) => {
  const { cityPath } = req.query;

  if (!cityPath) {
    res.json({ warning: 'cityPath must me specified' });
    return;
  }

  let city = await City.findOne({ name: cityPath });

  if (!city) {
    city = await City.create({ name: cityPath });;
  }

  res.status(200).json({ msg: 'scraping listings in progress' });

  const listings = await scrapeListings({ cityPath });

  listings.forEach(({ listingId, listingUrl, listingStartDate }) => {
    Listing.create({ listingId, listingUrl, listingStartDate, city: city._id })
  });
});

module.exports = router;
