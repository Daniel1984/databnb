const Neighborhood = require('../../models/neighborhood');
const scrapeListingsInfo = require('../../scripts/listingInfoScraper');
const getListingsWithAvailabilities = require('./helpers/getListingsWithAvailabilities');
const getListingsByLocation = require('./helpers/getListingsByLocation');
const getListingsByNeighborhood = require('./helpers/getListingsByNeighborhood');
const persistListingsWithAvailabilities = require('./helpers/persistListingsWithAvailabilities');

module.exports = async function pricePrediction({ lat, lng, bedrooms, address, socketId, socket }) {
  let listings = [];
  const neigborhood = await Neighborhood.findOne({ name: address });

  if (neigborhood) {
    listings = await getListingsByNeighborhood({ neighborhoodId: neigborhood._id, bedrooms });
  }

  if (!listings.length) {
    listings = await getListingsByLocation({ lat, lng, bedrooms });
  }

  if (listings.length) {
    const listingsWithAvailabilities = await getListingsWithAvailabilities(listings);
    socket.emit('listings', { listings: listingsWithAvailabilities });
    return;
  }

  listings = await scrapeListingsInfo({ suburb: address });

  if (!listings.length) {
    socket.emit('listings', { listings: [] });
    return;
  }

  listings = listings.filter(({ listing }) => listing.bedrooms == bedrooms);

  await persistListingsWithAvailabilities({ listings, address, socket });
  socket.emit('reenableForm', true);
};
