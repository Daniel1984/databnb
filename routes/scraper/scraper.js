const express = require('express');
const getCityPayments = require('./listingsPricingHandler');
const listingsInfoHandler = require('./listingsInfoHandler');
const listingsStartDateHandler = require('./listingsStartDateHandler');
const listingAvailabilityHistory = require('./listingAvailabilityHistory');

const router = express.Router();

router.get('/scrape-listings', listingsInfoHandler); // #1
router.get('/scrape-listings-start-dates', listingsStartDateHandler); // #2
router.get('/:cityId/scrape-listings-availability', listingAvailabilityHistory); // #3
router.get('/:cityId/get-city-payments', getCityPayments);

module.exports = router;
