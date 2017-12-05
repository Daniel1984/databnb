const express = require('express');
const City = require('../../models/city');
const Listing = require('../../models/listing');
const ListingAvailability = require('../../models/listingAvailability');

const router = express.Router();

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

async function getListingsWithAvailabilities(listings) {
  let listingsWithAvailabilities = [];

  do {
    const {
      _id,
      bedrooms,
      reviews_count,
      room_type,
      star_rating,
      lat,
      lng
    } = listings.shift();

    const listingAvailabilities = await ListingAvailability
      .find({ listing_id: _id })
      .sort('date')
      .select('available date price -_id');

    // agregate availabilities data, maybe month average in range,

    const listingWithAvailability = {
      bedrooms,
      reviews_count,
      room_type,
      star_rating,
      lat,
      lng,
      availability: listingAvailabilities,
    };

    listingsWithAvailabilities.push(listingWithAvailability);
  } while (listings.length);

  return listingsWithAvailabilities;
}

async function getListings({ lat, lng }) {
  // 0.001 ~ 110m which is reasonable to judge
  let coordinateOffset = 0.001;
  const minimumListingsToAnalyze = 50;
  const getPoitsWithDelta = getOffsetPossition({ lat, lng });

  let listings = [];

  do {
    const { maxLat, minLat, maxLng, minLng } = getPoitsWithDelta(coordinateOffset)

    listings = await Listing
      .find()
      .where('lat').gt(minLat).lt(maxLat)
      .where('lng').gt(minLng).lt(maxLng)
      .select('bedrooms reviews_count room_type star_rating lat lng');

    coordinateOffset += 0.001;
  } while (listings.length < minimumListingsToAnalyze);

  return {
    listings,
    coordinateOffset,
  };
}

router.get('/', async (req, res, next) => {
  const { city, lat, lng } = req.query;

  // const cityModel = await City.findOne({ name: /city/ig });

  // if (!cityModel) {
  //   res.status(400).json({ err: 'city not yet set' });
  // }

  const { listings, coordinateOffset } = await getListings({ lat, lng });
  const listingsWithAvailabilities = await getListingsWithAvailabilities(listings);

  res.status(200).json({ listingsWithAvailabilities });
});

module.exports = router;
