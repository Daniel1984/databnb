const express = require('express');
const listingsScraper = require('./listingsScraper');
const listingsHistoryScraper = require('./listingsHistoryScraper');

const router = express.Router();

router.get('/scrape-listings', listingsScraper);
router.get('/scrape-listings-history', listingsHistoryScraper);

module.exports = router;
