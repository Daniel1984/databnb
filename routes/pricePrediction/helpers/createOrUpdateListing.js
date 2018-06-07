const Listing = require('../../../models/listing');

module.exports = async function createOrUpdateListing({ listing, listingStartDate, suburbId }) {
  let persistedListing = await Listing.findOneAndUpdate({
    id: listing.id,
  }, {
    ...listing,
    geo: {
      type: 'Point',
      coordinates: [listing.lat, listing.lng],
    },
    listing_start_date: listingStartDate,
    availability_checked_at: Date.now(),
  });

  if (!persistedListing) {
    persistedListing = await Listing.create({
      ...listing,
      geo: {
        type: 'Point',
        coordinates: [listing.lat, listing.lng],
      },
      neighborhood_id: suburbId,
      listing_start_date: listingStartDate,
      availability_checked_at: Date.now(),
    });
  }

  return persistedListing;
}
