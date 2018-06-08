const ListingAvailability = require('../../../models/listingAvailability');

module.exports = async function persistListingAvailabilities({ availabilities, listingId, neighborhoodId }) {
  while (availabilities.length) {
    let { days = [] } = availabilities.shift();

    while (days.length) {
      const day = days.shift();

      try {
        const persistedAvailability = await ListingAvailability.findOneAndUpdate({
          listing_id: listingId,
          neighborhood_id: neighborhoodId,
          date: day.date,
        }, {
          ...day,
          updatedAt: new Date(),
        });

        if (!persistedAvailability) {
          await ListingAvailability.create({
            ...day,
            listing_id: listingId,
            neighborhood_id: neighborhoodId
          });
        }
      } catch (error) {
        console.log(`persistListingAvailabilities.js:availability:crud: ${error}`);
      }
    }
  }
}
