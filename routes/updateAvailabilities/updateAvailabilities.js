const express = require('express');
const ListingAvailability = require('../../models/listingAvailability');

const router = express.Router();

router.post('/', async (req, res) => {
  const { availabilities = [], listingId } = req.body;

  while (availabilities.length) {
    const { days = [] } = availabilities.shift();

    while (days.length) {
      const day = days.shift();

      try {
        const persistedAvailability = await ListingAvailability.findOneAndUpdate({
          id: listingId,
          date: day.date,
        }, {
          ...day,
          updatedAt: new Date(),
        });

        if (!persistedAvailability) {
          await ListingAvailability.create({
            ...day,
            id: listingId,
          });
        }
        res.status(200).json({ status: 'ok' });
      } catch (error) {
        res.status(500).json({ error, status: 'error' });
      }
    }
  }
});


module.exports = router;
