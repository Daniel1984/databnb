const scrapeListingsInfo = require('../../scripts/listingInfoScraper');
const getListingsWithAvailabilities = require('./helpers/getListingsWithAvailabilities');
const getListingsByLocation = require('./helpers/getListingsByLocation');
const persistListingsWithAvailabilities = require('./helpers/persistListingsWithAvailabilities');
const getOrCreateNeighborhood = require('./helpers/getOrCreateNeighborhood');

module.exports = async function pricePrediction({
  lat,
  lng,
  bedrooms,
  address,
  socket,
}) {
  const neighborhood = await getOrCreateNeighborhood(address);
  const listings = await getListingsByLocation({ lat, lng, bedrooms });
  const persistedListingsIds = listings.map(({ id }) => id);

  if (listings.length) {
    try {
      const listingsWithAvailabilities = await getListingsWithAvailabilities({ listings });
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
      await persistListingsWithAvailabilities({ listings: freshlyScrapedListings, socket });
    } catch (error) {
      console.log(`pricePrediction.js:persistListingsWithAvailabilities: ${error}`);
    }
  }

  socket.emit('reenableForm', true);
};
