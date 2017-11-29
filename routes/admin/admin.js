const express = require('express');
const citiesHandler = require('./citiesHandler');
const listingsHandler = require('./listingsHandler');
const neighborhoodHandler = require('./neighborhoodHandler');

const router = express.Router();
router.get('/cities', citiesHandler);
router.get('/cities/:cityId/neighborhoods', neighborhoodHandler);
router.get('/cities/:cityId/neighborhoods/:hoodId', listingsHandler);

module.exports = router;
