const Neighborhood = require('../../models/neighborhood');
const scrapeListingsInfo = require('../../scripts/listingInfoScraper');
const getListingsWithAvailabilities = require('./helpers/getListingsWithAvailabilities');
const getListingsByLocation = require('./helpers/getListingsByLocation');
const getListingsByNeighborhood = require('./helpers/getListingsByNeighborhood');
const persistListingsWithAvailabilities = require('./helpers/persistListingsWithAvailabilities');

module.exports = async function pricePrediction({ lat, lng, bedrooms, address, socket }) {
  let listings = [];
  let neigborhood;

  try {
    neigborhood = await Neighborhood.findOne({ name: address });
  } catch (error) {
    console.log(`Neighborhood.findOne: ${error}`);
  }

  if (neigborhood) {
    try {
      listings = await getListingsByNeighborhood({ neighborhoodId: neigborhood._id });
    } catch (error) {
      console.log(`getListingsByNeighborhood: ${error}`);
    }
  }

  if (!listings.length) {
    try {
      listings = await getListingsByLocation({ lat, lng });
    } catch (error) {
      console.log(`getListingsByLocation: ${error}`);
    }
  }

  if (listings.length) {
    try {
      const listingsWithAvailabilities = await getListingsWithAvailabilities(listings);
      socket.emit('listings', { listings: listingsWithAvailabilities });
      return;
    } catch (error) {
      console.log(`getListingsWithAvailabilities: ${error}`);
    }
  }

  try {
    listings = await scrapeListingsInfo({ suburb: address, socket });
  } catch (error) {
    console.log(`scrapeListingsInfo: ${error}`);
  }

  if (!listings.length) {
    socket.emit('listings', { listings: [] });
    return;
  }

  // listings = listings.filter(({ listing }) => listing.bedrooms == bedrooms);

  try {
    await persistListingsWithAvailabilities({ listings, address, socket });
  } catch (error) {
    console.log(`persistListingsWithAvailabilities: ${error}`);
  }

  socket.emit('reenableForm', true);
};
