const express = require('express');

const scrapeListings = require('../scripts/scrapeListings');
const City = require('../models/city');

const router = express.Router();

router.get('/cities', async (req, res, next) => {
  try {
    const cities = await City.find();
    res.status(200).json(cities);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.get('/cities/:cityId', async (req, res, next) => {
  try {
    const listings = await Listing.find({ city: req.props.cityId }, 'listingId listingUrl listingStartDate');
    res.status(200).json(listings);
  } catch (error) {
    res.status(400).json({ error });
  }
});
