const getListingStartDate = require('../../../scripts/reviewsScraper');
const { getAvailabilityUrl } = require('../../../scripts/utils');
const getListingAvailabilities = require('../../../scripts/listingAvailabilityScraper');
const getOrCreateNeighborhood = require('./getOrCreateNeighborhood');
const createOrUpdateListing = require('./createOrUpdateListing');
const persistListingAvailabilities = require('./persistListingAvailabilities');
const getListingsWithAvailabilities = require('./getListingsWithAvailabilities');

function getYearAndMonthForAirbnbUrl() {
  const today = new Date();
  today.setMonth(today.getMonth() - 1);

  return {
    year: today.getFullYear(),
    month: today.getMonth(),
  };
}

module.exports = function persistListingsWithAvailabilities({ listings, address, socket }) {
  return new Promise(async (resolve, reject) => {
    const suburb = await getOrCreateNeighborhood(address);
    const listingsWithAvailabilities = [];
    let analyzedProperties = 0;
    let totalProperties = listings.length;

    while (listings.length) {
      socket.emit('getListings:loadingInfo', {
        msg: `Loading ${analyzedProperties += 1}/${totalProperties} properties`
      });

      const { listing } = listings.shift();
      const listingStartDate = await getListingStartDate({ listingId: listing.id });
      const persistedListing = await createOrUpdateListing({ listing, listingStartDate, suburbId: suburb._id, availability_checked_at: Date.now() });
      const availabilityUrl = getAvailabilityUrl({ listingId: persistedListing.id, ...getYearAndMonthForAirbnbUrl() });
      const availabilities = await getListingAvailabilities(availabilityUrl);

      await persistListingAvailabilities({
        availabilities,
        listingId: persistedListing._id,
        neighborhoodId: persistedListing.neighborhood_id
      });

      const listingWithAvailabilities = await getListingsWithAvailabilities([persistedListing]);
      socket.emit('listing', { listing: listingWithAvailabilities });
      listingsWithAvailabilities.push(listingWithAvailabilities);
    }

    resolve(listingsWithAvailabilities);
  });
}
