const express = require('express');
const citiesHandler = require('./citiesHandler');
const listingsHandler = require('./listingsHandler');
const neighborhoodHandler = require('./neighborhoodHandler');
const listingsInfoHandler = require('./listingsInfoHandler');
const listingsStartDateHandler = require('./listingsStartDateHandler');
const listingAvailabilityHistory = require('./listingAvailabilityHistory');
const { getNeighborhoodPayments, getCityPayments } = require('./listingsPricingHandler');

const router = express.Router();

router.get('/test', (req, res) => res.status(200).json({ msg: 'all good 123' }));
router.get('/scrape-listings', listingsInfoHandler); // #1
router.get('/scrape-listings-start-dates', listingsStartDateHandler); // #2
router.get('/cities/:cityId/scrape-listings-availability', listingAvailabilityHistory); // #3
router.get('/cities', citiesHandler);
router.get('/cities/:cityId/neighborhoods', neighborhoodHandler);
router.get('/cities/:cityId/neighborhoods/:hoodId', listingsHandler);
router.get('/cities/:cityId/get-city-payments', getCityPayments);
router.get('/cities/:cityId/neighborhoods/:hoodId/get-neighborhood-payments', getNeighborhoodPayments);

module.exports = router;
