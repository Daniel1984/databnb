const Listing = require('../../../models/listing');
const constants = require('../../../constants.json');

module.exports = async function getListingsByLocation({ lat, lng, bedrooms }) {
  try {
    const listings = await Listing
      .where('bedrooms')
      .equals(bedrooms)
      .where('geo')
      .near({
        center: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        maxDistance: constants.searchRadius,
      });
    return listings;
  } catch (error) {
    console.log('getListingsByLocation.js', error);
    return [];
  }
};
