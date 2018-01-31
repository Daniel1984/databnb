const Neighborhood = require('../../models/neighborhood');
const scrapeListingsInfo = require('../../scripts/listingInfoScraper');
const getListingsWithAvailabilities = require('./helpers/getListingsWithAvailabilities');
const getListingsByLocation = require('./helpers/getListingsByLocation');
// const getListingsByNeighborhood = require('./helpers/getListingsByNeighborhood');
const persistListingsWithAvailabilities = require('./helpers/persistListingsWithAvailabilities');
const getOrCreateNeighborhood = require('./helpers/getOrCreateNeighborhood');

module.exports = async function pricePrediction({ lat, lng, bedrooms, address, socket }) {
  let listings = [];
  let neighborhood;

  try {
    neighborhood = await Neighborhood.findOne({ name: address });
  } catch (error) {
    console.log(`pricePrediction.js:Neighborhood.findOne: ${error}`);
  }

  // if (neighborhood) {
  //   try {
  //     listings = await getListingsByNeighborhood({ neighborhoodId: neighborhood._id, bedrooms });
  //   } catch (error) {
  //     console.log(`pricePrediction.js:getListingsByNeighborhood: ${error}`);
  //   }
  // }

  if (!listings.length) {
    try {
      listings = await getListingsByLocation({ lat, lng, bedrooms });
    } catch (error) {
      console.log(`pricePrediction.js:getListingsByLocation: ${error}`);
    }
  }

  if (listings.length) {
    try {
      const listingsWithAvailabilities = await getListingsWithAvailabilities({ listings, neighborhoodId: neighborhood._id });
      socket.emit('listings', { listings: listingsWithAvailabilities });
      return;
    } catch (error) {
      console.log(`pricePrediction.js:getListingsWithAvailabilities: ${error}`);
    }
  }

  neighborhood = await getOrCreateNeighborhood(address);

  try {
    listings = await scrapeListingsInfo({ suburb: neighborhood.name, socket, bedrooms });
  } catch (error) {
    console.log(`pricePrediction.js:scrapeListingsInfo: ${error}`);
  }

  if (!listings.length) {
    socket.emit('listings', { listings: [] });
    return;
  }

  try {
    await persistListingsWithAvailabilities({ listings, neighborhood, socket });
  } catch (error) {
    console.log(`pricePrediction.js:persistListingsWithAvailabilities: ${error}`);
  }

  socket.emit('reenableForm', true);
};
