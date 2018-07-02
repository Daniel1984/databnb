const Listing = require('../../../models/listing');

module.exports = async function createOrUpdateListing({ listing, listingStartDate }) {
  const payload = {
    listing_start_date: listingStartDate,
    availability_checked_at: Date.now(),
    geo: {
      type: 'Point',
      coordinates: [listing.lng, listing.lat],
    },
  };

  let persistedListing = await Listing.findOneAndUpdate(
    { id: listing.id },
    { ...listing, ...payload }
  );

  if (!persistedListing) {
    persistedListing = await Listing.create({ ...listing, ...payload });
  }

  return persistedListing;
};
