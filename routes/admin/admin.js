const express = require('express');
const citiesHandler = require('./citiesHandler');
const listingsHandler = require('./listingsHandler');
const listingsHistoryHandler = require('./listingsHistoryHandler');
const neighborhoodHandler = require('./neighborhoodHandler');
const listingsInfoHandler = require('./listingsInfoHandler');
const listingsStartDateHandler = require('./listingsStartDateHandler');
const { getNeighborhoodPayments, getCityPayments } = require('./listingsPricingHandler');

const router = express.Router();

router.get('/scrape-listings', listingsInfoHandler); // #1
router.get('/scrape-listings-start-dates', listingsStartDateHandler); // #2
router.get('/cities', citiesHandler);
router.get('/cities/:cityId/neighborhoods', neighborhoodHandler);
router.get('/cities/:cityId/neighborhoods/:hoodId', listingsHandler);
router.get('/cities/:cityId/get-city-payments', getCityPayments);
router.get('/cities/:cityId/neighborhoods/:hoodId/get-neighborhood-payments', getNeighborhoodPayments);

module.exports = router;
