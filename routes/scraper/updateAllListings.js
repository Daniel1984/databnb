const Neighborhood = require('../../models/neighborhood');
const scrapeListings = require('../../scripts/listingInfoScraper');
const getListingStartDate = require('../../scripts/reviewsScraper');
const { getAvailabilityUrl } = require('../../scripts/utils');
const getListingAvailabilities = require('../../scripts/listingAvailabilityScraper');
const createOrUpdateListing = require('../pricePrediction/helpers/createOrUpdateListing');
const persistListingAvailabilities = require('../pricePrediction/helpers/persistListingAvailabilities');

function getYearAndMonthForAirbnbUrl() {
  const today = new Date();
  today.setMonth(today.getMonth() + 1);

  return {
    year: today.getFullYear(),
    month: today.getMonth(),
  };
}

module.exports = async (req, res, next) => {
  const neighborhoods = await Neighborhood.find();
  // const neighborhoods = [{ name: 'bromley, london', _id: '5a2328588670a001959a6ea7' }];
  res.status(200).json({ length: neighborhoods });

  while (neighborhoods.length) {
    const neighborhood = neighborhoods.shift();

    const listings = await scrapeListings({ suburb: neighborhood.name });

    while (listings.length) {
      const { listing } = listings.shift();

      let listingStartDate;
      try {
        listingStartDate = await getListingStartDate({ listingId: listing.id });
      } catch (error) {
        console.log(`persistListingsWithAvailabilities.js:getListingStartDate: ${error}`);
      }

      let persistedListing;
      try {
        persistedListing = await createOrUpdateListing({ listing, listingStartDate, suburbId: neighborhood._id });
      } catch (error) {
        console.log(`persistListingsWithAvailabilities.js:createOrUpdateListing: ${error}`);
      }

      const availabilityUrl = getAvailabilityUrl({ listingId: persistedListing.id, ...getYearAndMonthForAirbnbUrl() });

      let availabilities;
      try {
        availabilities = await getListingAvailabilities(availabilityUrl);
      } catch (error) {
        console.log(`persistListingsWithAvailabilities.js:getListingAvailabilities: ${error}`);
      }

      try {
        await persistListingAvailabilities({
          availabilities,
          listingId: persistedListing._id,
          neighborhoodId: neighborhood._id,
        });
      } catch (error) {
        console.log(`persistListingsWithAvailabilities.js:persistListingAvailabilities: ${error}`);
      }
    }
  }
}
