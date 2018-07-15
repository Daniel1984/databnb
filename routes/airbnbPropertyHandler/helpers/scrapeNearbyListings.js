const listingInfoScraper = require('../../../scripts/listingInfoScraper');
const persistListingsWithAvailabilities = require('../../pricePrediction/helpers/persistListingsWithAvailabilities');
const getOrCreateNeighborhood = require('../../pricePrediction/helpers/getOrCreateNeighborhood');

module.exports = async ({ location, socket }) => {
  const neighborhood = await getOrCreateNeighborhood(location);
  const listings = await listingInfoScraper({ suburb: neighborhood.name, socket });

  if (listings.length) {
    try {
      await persistListingsWithAvailabilities({ listings, socket });
    } catch (error) {
      console.log(`scrapeNearbyListings.js:persistListingsWithAvailabilities: ${error}`);
    }
    socket.emit('nearbyListings:done');
  }
};

/*
 *
 * might neew to consider filter by bedrooms as takes too long
 *
 * filterlistings so that params bedrooms count are first in the list
 */
