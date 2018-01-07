const express = require('express');
const listingsHandler = require('./listingsHandler');
const neighborhoodHandler = require('./neighborhoodHandler');

const router = express.Router();
router.get('/neighborhoods', neighborhoodHandler);
router.get('/neighborhoods/:hoodId', listingsHandler);

module.exports = router;
