const ListingAvailability = require('../../../models/listingAvailability');

module.exports = async function persistListingAvailabilities({ availabilities, listingId }) {
  while (availabilities.length) {
    const { days = [] } = availabilities.shift();

    while (days.length) {
      const day = days.shift();

      try {
        const persistedAvailability = await ListingAvailability.findOneAndUpdate({
          listing_id: listingId,
          date: day.date,
        }, {
          ...day,
          updatedAt: new Date(),
        });

        if (!persistedAvailability) {
          await ListingAvailability.create({
            ...day,
            listing_id: listingId,
          });
        }
      } catch (error) {
        console.log(`persistListingAvailabilities.js:availability:crud: ${error}`);
      }
    }
  }
};
