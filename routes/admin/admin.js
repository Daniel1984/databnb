const express = require('express');
const { index, show } = require('./citiesHandler');

const router = express.Router();

router.get('/cities', index);
router.get('/cities/:cityId', show);

module.exports = router;
