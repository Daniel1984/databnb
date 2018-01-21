const getListingStartDate = require('../../../scripts/reviewsScraper');
const { getAvailabilityUrl } = require('../../../scripts/utils');
const getListingAvailabilities = require('../../../scripts/listingAvailabilityScraper');
const createOrUpdateListing = require('./createOrUpdateListing');
const persistListingAvailabilities = require('./persistListingAvailabilities');
const getListingsWithAvailabilities = require('./getListingsWithAvailabilities');

function getYearAndMonthForAirbnbUrl() {
  const today = new Date();
  today.setMonth(today.getMonth() + 1);

  return {
    year: today.getFullYear(),
    month: today.getMonth(),
  };
}

module.exports = function persistListingsWithAvailabilities({ listings, neighborhood, socket }) {
  return new Promise(async (resolve, reject) => {
    const listingsWithAvailabilities = [];
    let analyzedProperties = 0;
    let totalProperties = listings.length;

    while (listings.length) {
      socket.emit('getListings:loadingInfo', {
        msg: `Analyzing ${analyzedProperties += 1}/${totalProperties} properties`
      });

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
          neighborhoodId: persistedListing.neighborhood_id
        });
      } catch (error) {
        console.log(`persistListingsWithAvailabilities.js:persistListingAvailabilities: ${error}`);
      }

      let listingWithAvailabilities;
      try {
        listingWithAvailabilities = await getListingsWithAvailabilities({ listings: [persistedListing] });
        socket.emit('listing', { listing: listingWithAvailabilities });
        listingsWithAvailabilities.push(listingWithAvailabilities);
      } catch (error) {
        console.log(`persistListingsWithAvailabilities.js:getListingsWithAvailabilities: ${error}`);
      }
    }

    resolve(listingsWithAvailabilities);
  });
}
