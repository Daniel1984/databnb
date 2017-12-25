const format = require('date-fns/format');
const _ = require('lodash');
const ListingAvailability = require('../../../models/listingAvailability');

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

module.exports = async (listings) => {
  let listingsWithAvailabilities = [];

  if (!listings.length) {
    return [];
  }

  while (listings.length) {
    const {
      _id,
      bedrooms,
      reviews_count,
      room_type,
      star_rating,
      lat,
      lng,
      listing_start_date,
    } = listings.shift();

    let listingAvailabilities = await ListingAvailability
      .where({ listing_id: _id })
      .sort('date')
      .select('available date price -_id');

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
      availability: agregatedAvailabilities,
    };

    listingsWithAvailabilities.push(listingWithAvailability);
  };

  return listingsWithAvailabilities;
}
