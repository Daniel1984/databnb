const ListingHistory = require('../../models/listingHistory');

module.exports = async (req, res, next) => {
  const { listingId: listing } = req.params;

  const desiredFields = `
    check_out
    check_in
    listing_lng
    listing_lat
    star_rating
    city
    bedrooms
    currency
    amount_including_fees
  `;

  try {
    const listingsHistory = await ListingHistory.find({ listing }, desiredFields);
    res.render('admin/listingsHistory', { history: listingsHistory });
  } catch (error) {
    next(error);
  }
}
