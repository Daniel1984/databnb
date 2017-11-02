const scrapeListingsHistory = require('../../scripts/scrapeListingsHistory');
const Listing = require('../../models/listing');
const ListingHistory = require('../../models/listingHistory');

module.exports = async (req, res, next) => {
  const { listingId } = req.query;

  if (!listingId) {
    res.json({ warning: 'listingId must be specified' });
    return;
  }

  const listing = await Listing.findOne({ _id: listingId });

  if (listing) {
    res.status(200).json({ msg: 'scraping listing history in progress' });

    const listingsHistory = await scrapeListingsHistory(listing);

    listingsHistory.forEach((listingHistory) => {
      ListingHistory.create(listingHistory);
    });

    await Listing.findByIdAndUpdate(listingId, { scraped: true });

    return;
  }

  res.status(400).json({ err: 'Could no find listing with provided ID'});
};
