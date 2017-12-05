const express = require('express');
const City = require('../../models/city');
const Listing = require('../../models/listing');

const router = express.Router();

// 0.009 === 1km
// 0.004 < 0.5km which is reasonable to judge
const DISTANCE_OFFSET = 0.001;
const MIN_LISTINGS_TO_ANALYZE = 50;

const getOffsetPossition = ({ lat, lng }) => delta => {
  const maxLat = Number(Number(lat) + delta).toFixed(4);
  const minLat = Number(Number(lat) - delta).toFixed(4);
  const maxLng = Number(Number(lng) + delta).toFixed(4);
  const minLng = Number(Number(lng) - delta).toFixed(4);

  return {
    maxLat,
    minLat,
    maxLng,
    minLng,
  };
}

router.get('/', async (req, res, next) => {
  const { city, lat, lng } = req.query;

  // const cityModel = await City.findOne({ name: /city/ig });

  // if (!cityModel) {
  //   res.status(400).json({ err: 'city not yet set' });
  // }

  const getPoitsWithDelta = getOffsetPossition({ lat, lng });

  let listings = [];
  let distanceIncreaseBy = 0;

  do {
    const { maxLat, minLat, maxLng, minLng } = getPoitsWithDelta(DISTANCE_OFFSET + distanceIncreaseBy)

    listings = await Listing
      .find({})
      .where('lat').gt(minLat).lt(maxLat)
      .where('lng').gt(minLng).lt(maxLng);

    distanceIncreaseBy += DISTANCE_OFFSET;
  } while (listings.length < MIN_LISTINGS_TO_ANALYZE);

  res.status(200).json({ listings });
});

module.exports = router;
