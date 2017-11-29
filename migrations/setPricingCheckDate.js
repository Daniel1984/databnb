const Listing = require('../models/listing');

(async () => {
  const listings = await Listing.find();
  listings.forEach((listing) => {
    Listing.findById(listing.id, { pricing_checked_at: listing.availability_checked_at });
  });
})();
