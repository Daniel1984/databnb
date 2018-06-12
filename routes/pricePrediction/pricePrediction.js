const uniqBy = require('lodash/uniqBy');
const scrapeListingsInfo = require('../../scripts/listingInfoScraper');
const getListingsWithAvailabilities = require('./helpers/getListingsWithAvailabilities');
const getListingsByLocation = require('./helpers/getListingsByLocation');
const getListingsByNeighborhood = require('./helpers/getListingsByNeighborhood');
const persistListingsWithAvailabilities = require('./helpers/persistListingsWithAvailabilities');
const getOrCreateNeighborhood = require('./helpers/getOrCreateNeighborhood');

module.exports = async function pricePrediction({
  lat,
  lng,
  bedrooms,
  address,
  socket,
}) {
  let neighborhood;

  try {
    neighborhood = await getOrCreateNeighborhood(address);
  } catch (error) {
    console.log(`pricePrediction.js:getOrCreateNeighborhood: ${error}`);
  }

  let listingsByNeighborhood = [];
  try {
    listingsByNeighborhood = await getListingsByNeighborhood({ neighborhoodId: neighborhood._id, bedrooms });
  } catch (error) {
    console.log(`pricePrediction.js:getListingsByNeighborhood: ${error}`);
  }

  let listingsByLocation = [];
  try {
    listingsByLocation = await getListingsByLocation({ lat, lng, bedrooms });
  } catch (error) {
    console.log(`pricePrediction.js:getListingsByLocation: ${error}`);
  }

  const persistedListings = uniqBy([...listingsByNeighborhood, ...listingsByLocation], 'id');
  const persistedListingsIds = persistedListings.map(({ id }) => id);
  if (persistedListings.length) {
    try {
      const listingsWithAvailabilities = await getListingsWithAvailabilities({
        listings: persistedListings,
        neighborhoodId: neighborhood._id,
      });
      socket.emit('listings', { listings: listingsWithAvailabilities });
    } catch (error) {
      console.log(`pricePrediction.js:getListingsWithAvailabilities: ${error}`);
    }
  }

  let freshlyScrapedListings = [];
  try {
    freshlyScrapedListings = await scrapeListingsInfo({
      suburb: neighborhood.name,
      socket,
      bedrooms,
      persistedListingsIds,
    });
  } catch (error) {
    console.log(`pricePrediction.js:scrapeListingsInfo: ${error}`);
  }

  if (freshlyScrapedListings.length) {
    try {
      await persistListingsWithAvailabilities({ listings: freshlyScrapedListings, neighborhood, socket });
    } catch (error) {
      console.log(`pricePrediction.js:persistListingsWithAvailabilities: ${error}`);
    }
  }

  socket.emit('reenableForm', true);
};
