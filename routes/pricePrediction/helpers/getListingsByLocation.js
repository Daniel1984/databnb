const Listing = require('../../../models/listing');

module.exports = function getListingsByLocation({ lat, lng, bedrooms }) {

  return Listing
    .where('geo')
    .near({
      center: {
        type: 'Point',
        coordinates: [lat, lng],
      },
      maxDistance: 5,
    })
    .where('bedrooms')
    .equals(bedrooms)
    .select('bedrooms reviews_count room_type star_rating lat lng listing_start_date id');
};
