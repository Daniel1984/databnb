const getListingStartDate = require('../../../scripts/reviewsScraper');
const { getAvailabilityUrl, getYearAndMonthForAirbnbUrl } = require('../../../scripts/utils');
const getListingAvailabilities = require('../../../scripts/listingAvailabilityScraper');
const createOrUpdateListing = require('./createOrUpdateListing');
const persistListingAvailabilities = require('./persistListingAvailabilities');
const getListingsWithAvailabilities = require('./getListingsWithAvailabilities');

module.exports = async function persistListingsWithAvailabilities({ listings, neighborhood, socket }) {
  const listingsWithAvailabilities = [];
  let analyzedProperties = 0;
  const totalProperties = listings.length;

  while (listings.length) {
    socket.emit('getListings:loadingInfo', {
      msg: `Analyzing ${analyzedProperties += 1}/${totalProperties} properties`,
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
        neighborhoodId: persistedListing.neighborhood_id,
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

  return listingsWithAvailabilities;
};
