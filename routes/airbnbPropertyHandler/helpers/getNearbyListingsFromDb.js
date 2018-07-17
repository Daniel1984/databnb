const Listing = require('../../../models/listing');
const constants = require('../../../constants');

module.exports = async ({ geo: { coordinates } }) => {
  try {
    const nearbyListings = await Listing
      .where('geo')
      .near({
        center: {
          type: 'Point',
          coordinates,
        },
        maxDistance: constants.searchRadius, // maxDinstance is in meters :O
      });

    return nearbyListings;
  } catch (error) {
    return [];
  }
};
