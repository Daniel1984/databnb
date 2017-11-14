const addMonths = require('date-fns/add_months');
const request = require('request');
const { getReviewsUrl } = require('../../scripts/utils');
const Listing = require('../../models/listing');
const reviewsScraper = require('../../scripts/reviewsScraper');

module.exports = async (req, res, next) => {
  res.status(200).json({ msg: 'started searching start dates for listings' });

  const listings = await Listing.find({ available: true, has_start_date: false });

  do {
    const { id, _id } = listings.shift();
    const listingStartDate = await reviewsScraper({ listingId: id });

    await Listing.findByIdAndUpdate(_id, { has_start_date: true, listing_start_date: listingStartDate });
  } while (listings.length);
}
