const scrapeListingsHistory = require('../../scripts/scrapeListingsHistory');
const Listing = require('../../models/listing');
const ListingHistory = require('../../models/listingHistory');

module.exports = async (req, res, next) => {
  const { cityId: city } = req.params;

  if (!city) {
    res.status(200).json({ warning: 'cityId must be specified' });
    return;
  }

  const listings = await Listing.find({ city, scraped: false });

  if (!listings || !listings.length) {
    res.status(200).json({ warning: 'No listings found' });
    return;
  }

  res.status(200).json({ msg: 'scraping all listings history in progress' });

  do {
    const listing = listings.shift();
    const listingHistory = await scrapeListingsHistory(listing);

    listingHistory.forEach((history) => {
      ListingHistory.create(history);
    });

    if (listingHistory.length) { // sometimes property is unavailable and we have 0 records of it
      await Listing.findByIdAndUpdate(listing._id, { scraped: true });
    }
  } while (listings.length);

  console.log('DONE SCRAPING ALL LISTINGS HISTORY');
};
