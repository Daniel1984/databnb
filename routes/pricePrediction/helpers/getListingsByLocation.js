const Listing = require('../../../models/listing');

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
        maxDistance: 1000,
      });
    return listings;
  } catch (error) {
    console.log('getListingsByLocation.js', error);
    return [];
  }
};
