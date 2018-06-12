const Listing = require('../../../models/listing');

module.exports = function getListingsByLocation({ lat, lng, bedrooms }) {
  return Listing
    .where('bedrooms')
    .equals(bedrooms)
    .where('geo')
    .near({
      center: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      maxDistance: 5,
    });
  // .limit(100)
  // .select('bedrooms reviews_count room_type star_rating lat lng listing_start_date id');
};
