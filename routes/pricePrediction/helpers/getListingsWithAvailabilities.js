const format = require('date-fns/format');
const uniqBy = require('lodash/uniqBy');
const { getAvailabilityUrl } = require('../../../scripts/utils');
const getListingAvailabilities = require('../../../scripts/listingAvailabilityScraper');
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

function getCurrentDayPrice(availabilities) {
  const today = format(new Date(), 'YYYY-MM-DD');

  return availabilities.reduce((accumulator, { date, price }) => {
    if (today === format(date, 'YYYY-MM-DD')) {
      accumulator = price;
    }

    return accumulator;
  }, 0);
}

module.exports = async ({ listings }) => {
  if (!listings.length) {
    return [];
  }

  const listingsWithAvailabilities = [];

  while (listings.length) {
    const {
      _id,
      id,
      bedrooms,
      reviews_count,
      room_type,
      star_rating,
      geo,
      listing_start_date,
      picture_url,
    } = listings.shift();

    let listingAvailabilities = await ListingAvailability
      .where({ listing_id: _id })
      .sort('date')
      .select('available date price -_id');

    if (!listingAvailabilities || !listingAvailabilities.length) {
      const availabilityUrl = getAvailabilityUrl({ listingId: id });

      try {
        let availabilities = await getListingAvailabilities(availabilityUrl);

        availabilities = availabilities.reduce((acc, { days = [] }) => {
          const amendedDays = days.map(day => ({ ...day, listing_id: _id }));
          acc = [...acc, ...amendedDays];
          return acc;
        }, []);

        listingAvailabilities = await ListingAvailability.insertMany(availabilities);
      } catch (error) {
        console.log(`persistListingsWithAvailabilities.js:getListingAvailabilities: ${error}`);
        continue;
      }
    }

    if (!listingAvailabilities.length) {
      continue;
    }

    listingAvailabilities = uniqBy(listingAvailabilities, ({ date }) => date.toString());

    const currentMonthAvailabilities = format(new Date(), 'MMMM-YYYY');
    const nextMonthAvailabilities = format((new Date()).setMonth((new Date()).getMonth() + 1), 'MMMM-YYYY');
    const agregatedAvailabilities = getAgregatedAvailabilities(listingAvailabilities);
    const agregatedAvailability = agregatedAvailabilities[currentMonthAvailabilities] || agregatedAvailabilities[nextMonthAvailabilities];

    if (!agregatedAvailability) {
      continue;
    }

    const { nativeCurrency, availabilities } = agregatedAvailability;
    const listingWithAvailability = {
      bedrooms,
      reviews_count,
      room_type,
      star_rating,
      geo,
      id,
      listing_start_date,
      picture_url,
      currentDayPrice: getCurrentDayPrice(availabilities),
      currency: nativeCurrency,
      availability: agregatedAvailabilities,
    };

    listingsWithAvailabilities.push(listingWithAvailability);
  }

  return listingsWithAvailabilities;
};
