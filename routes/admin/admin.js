const express = require('express');
const citiesHandler = require('./citiesHandler');
const listingsHandler = require('./listingsHandler');
const availabilityHandler = require('./availabilityHandler');
const listingsHistoryHandler = require('./listingsHistoryHandler');

const router = express.Router();

router.get('/cities', citiesHandler);
router.get('/cities/:cityId/listings', listingsHandler);
router.get('/cities/:cityId/listings/:listingId', listingsHistoryHandler);
router.get('/cities/:cityId/availability', availabilityHandler);

module.exports = router;
