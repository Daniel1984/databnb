const Listing = require('../../../models/listing');

const getOffsetPossition = ({ lat, lng }) => delta => {
  const maxLat = (Number(lat) + delta).toFixed(4);
  const minLat = (Number(lat) - delta).toFixed(4);
  const maxLng = (Number(lng) + delta).toFixed(4);
  const minLng = (Number(lng) - delta).toFixed(4);

  return { maxLat, minLat, maxLng, minLng };
}

module.exports = function getListingsByLocation({ lat, lng, bedrooms }) {
  const getPoitsWithDelta = getOffsetPossition({ lat, lng });
  const { maxLat, minLat, maxLng, minLng } = getPoitsWithDelta(0.006);

  return Listing
    .where('bedrooms').equals(bedrooms)
    .where('lat').gte(minLat).lte(maxLat)
    .where('lng').gte(minLng).lte(maxLng)
    // .limit(100)
    .select('bedrooms reviews_count room_type star_rating lat lng listing_start_date id');
}
