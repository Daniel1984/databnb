const express = require('express');
const format = require('date-fns/format')
const groupBy = require('lodash/fp/groupBy');
const map = require('lodash/fp/map');
const flow = require('lodash/fp/flow');
const sumBy = require('lodash/fp/sumBy');
const City = require('../../models/city');
const Listing = require('../../models/listing');
const ListingAvailability = require('../../models/listingAvailability');
const _ = require('lodash');

const router = express.Router();

const getOffsetPossition = ({ lat, lng }) => delta => {
  const maxLat = (Number(lat) + delta).toFixed(4);
  const minLat = (Number(lat) - delta).toFixed(4);
  const maxLng = (Number(lng) + delta).toFixed(4);
  const minLng = (Number(lng) - delta).toFixed(4);

  return {
    maxLat,
    minLat,
    maxLng,
    minLng,
  };
}

function getAgregatedAvailabilities(availabilities) {
  return availabilities.reduce((accumulator, { date, available, price }) => {
    const key = format(date, 'MMMM-YYYY');

    accumulator[key] = accumulator[key] || {
      availabilities: [],
      nativePriceTotal: 0,
      nativeAdjustedPriceTotal: 0,
      nativeCurrency: null,
    };

    accumulator[key].availabilities.push({ date, available, price: price.native_price });
    accumulator[key].nativePriceTotal += price.native_price;
    accumulator[key].nativeAdjustedPriceTotal += price.native_adjusted_price;
    accumulator[key].nativeCurrency = accumulator[key].nativeCurrency || price.native_currency;

    return accumulator;
  }, {});
}

async function getListingsWithAvailabilities(listings) {
  let listingsWithAvailabilities = [];

  if (!listings.length) {
    return [];
  }

  do {
    const {
      _id,
      bedrooms,
      reviews_count,
      room_type,
      star_rating,
      lat,
      lng,
      listing_start_date,
      city_id,
    } = listings.shift();

    let listingAvailabilities = await ListingAvailability
      .find({ listing_id: _id })
      .sort('date')
      .select('available date price -_id');

    const city = await City.findById(city_id);

    listingAvailabilities = _.uniqBy(listingAvailabilities, ({ date }) => date.toString());

    const agregatedAvailabilities = getAgregatedAvailabilities(listingAvailabilities);

    const listingWithAvailability = {
      bedrooms,
      reviews_count,
      room_type,
      star_rating,
      lat,
      lng,
      listing_start_date,
      city: city.name,
      availability: agregatedAvailabilities,
    };

    listingsWithAvailabilities.push(listingWithAvailability);
  } while (listings.length);

  return listingsWithAvailabilities;
}

async function getListings({ lat, lng, bedrooms, cityId }) {
  const getPoitsWithDelta = getOffsetPossition({ lat, lng });
  const { maxLat, minLat, maxLng, minLng } = getPoitsWithDelta(0.007)
  const listings = await Listing
    .where('city_id').equals(cityId)
    .where('bedrooms').equals(bedrooms)
    .where('lat').gt(minLat).lt(maxLat)
    .where('lng').gt(minLng).lt(maxLng)
    .limit(60)
    .select('bedrooms reviews_count room_type star_rating lat lng listing_start_date city_id');

  return listings;
}

router.get('/', async (req, res, next) => {
  const { city, lat, lng, bedrooms } = req.query;
  const cityModel = await City.findOne({ name: city.toLowerCase() });

  if (!cityModel) {
    res.status(400).json({ err: 'city not yet set' });
  }

  const listings = await getListings({ lat, lng, bedrooms, cityId: cityModel._id });
  const listingsWithAvailabilities = await getListingsWithAvailabilities(listings);

  res.status(200).json({ listingsWithAvailabilities });
});

module.exports = router;
