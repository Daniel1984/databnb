const express = require('express');
const getCityPayments = require('./listingsPricingHandler');
const listingsInfoHandler = require('./listingsInfoHandler');
const listingsStartDateHandler = require('./listingsStartDateHandler');
const updateAllListings = require('./updateAllListings');
const {
  getListingAvailabilityHistory,
  updateListingAvailabilityHistory,
} = require('./listingAvailabilityHistory');

const router = express.Router();

router.get('/scrape-listings', listingsInfoHandler); // #1
router.get('/scrape-listings-start-dates', listingsStartDateHandler); // #2
router.get('/scrape-listings-availability', getListingAvailabilityHistory); // #3
router.get('/update-listings-availability', updateListingAvailabilityHistory); // #4
router.get('/get-city-payments', getCityPayments);
router.get('/update-all-listings', updateAllListings);

module.exports = router;
