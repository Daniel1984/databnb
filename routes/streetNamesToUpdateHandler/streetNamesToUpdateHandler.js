const startOfYesterday = require('date-fns/start_of_yesterday');
const express = require('express');
const Neighborhood = require('../../models/neighborhood');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const neighborhoods = await Neighborhood.where({
      $or: [
        { listingsScrapedAt: null },
        { where: { $lt: startOfYesterday() } },
      ],
    });

    res.status(200).json((
      neighborhoods
        .map(({ name }) => name)
        .filter(name => !!name)
    ));
  } catch (error) {
    res.status(500).json({ err: 'server error', error });
  }
});

module.exports = router;
