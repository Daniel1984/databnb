const express = require('express');
const Listing = require('../../models/listing');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const transformedListingsPayload = req.body.map(({ listing }) => {
      const {
        lat,
        lng,
        bedroom_label,
        bed_label,
        ...rest
      } = listing;

      return {
        ...rest,
        geo: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      };
    });

    while (transformedListingsPayload.length) {
      const listing = transformedListingsPayload.shift();

      let persistedListing = await Listing.findOneAndUpdate({ id: listing.id }, { ...listing });

      if (!persistedListing) {
        persistedListing = await Listing.create({ ...listing });
      }
    }

    res.status(200).json({ status: 'OK' });
  } catch (error) {
    res.status(500).json({ err: 'server error', error });
  }
});

module.exports = router;
