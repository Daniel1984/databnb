const express = require('express');
const endOfDay = require('date-fns/end_of_day');
const startOfDay = require('date-fns/start_of_day');
const addDays = require('date-fns/add_days');
const Listing = require('../../models/listing');
const ListingAvailability = require('../../models/listingAvailability');
const verifyToken = require('../../middleware/verifyToken');
const getOrScrapeProperty = require('./helpers/getOrScrapeListing');
const getNearbyListingsFromDb = require('./helpers/getNearbyListingsFromDb');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ user_id: req.userId });
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ err: 'server error', error });
  }
});

router.get('/:listingId', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);

    let nearbyListings = await getNearbyListingsFromDb(listing);
    nearbyListings = nearbyListings.filter(({ id }) => listing.id !== id);

    const listingAvailabilities = await Promise.all(nearbyListings.map(({ _id }) => {
      const today = new Date();
      return ListingAvailability.find({
        listing_id: _id,
        date: {
          $gte: startOfDay(today),
          $lte: endOfDay(addDays(today, 5)),
        },
      });
    }));

    res.status(200).json({
      listing,
      nearbyListings,
      listingAvailabilities,
    });
  } catch (error) {
    res.status(500).json({ err: 'server error', error });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const listing = await getOrScrapeProperty({ listingId: req.body.propertyId, userId: req.userId });
    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({ err: true, error });
  }
});

router.put('/removeUser/:listingId', verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.listingId, { user_id: null });
    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({ err: true, error });
  }
});

module.exports = router;
