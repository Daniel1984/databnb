const Listing = require('../../../models/listing');

module.exports = function getListingsByNeighborhood({ neighborhoodId, bedrooms }) {
  return Listing
    .where('neighborhood_id').equals(neighborhoodId)
    .where('bedrooms').equals(bedrooms);
  // .limit(100)
  // .select('bedrooms reviews_count room_type star_rating lat lng listing_start_date id');
};
