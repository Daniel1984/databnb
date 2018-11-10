const express = require('express');
const ListingAvailability = require('../../models/listingAvailability');
const Listing = require('../../models/listing');

const router = express.Router();

router.post('/', async (req, res) => {
  const { availabilities = [], listingId } = req.body;

  try {
    const listing = await Listing.findOne({ id: listingId });

    while (listing && availabilities.length) {
      const availability = availabilities.shift();

      try {
        const persistedAvailability = await ListingAvailability.findOneAndUpdate({
          listing_id: listing._id,
          date: availability.date,
        }, {
          ...availability,
          updatedAt: new Date(),
        });

        if (!persistedAvailability) {
          await ListingAvailability.create({
            ...availability,
            listing_id: listing._id,
          });
        }
      } catch (error) {
        console.log('Create availability - ', error);
      }
    }
  } catch (error) {
    console.log('Find listing - ', error);
  }

  res.status(200).json({ status: 'done saving' });
});


module.exports = router;
