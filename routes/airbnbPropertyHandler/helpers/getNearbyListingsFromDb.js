const Listing = require('../../../models/listing');

module.exports = async ({ bedrooms, geo: { coordinates } }) => {
  try {
    const nearbyListings = await Listing
      .where('bedrooms')
      .equals(bedrooms)
      .where('geo')
      .near({
        center: {
          type: 'Point',
          coordinates,
        },
        maxDistance: 1000, // maxDinstance is in meters :O
      });

    return nearbyListings;
  } catch (error) {
    return [];
  }
};
