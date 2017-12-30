const ListingAvailability = require('../../../models/listingAvailability');

module.exports = async function persistListingAvailabilities({ availabilities, listingId, neighborhoodId }) {
  while (availabilities.length) {
    let { days = [] } = availabilities.shift();

    while (days.length) {
      const day = days.shift();

      await ListingAvailability.create({
        ...day,
        listing_id: listingId,
        neighborhood_id: neighborhoodId
      });
    }
  }
}
