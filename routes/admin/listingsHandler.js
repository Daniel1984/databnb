const City = require('../../models/city');
const Listing = require('../../models/listing');

module.exports = async (req, res, next) => {
  try {
    const { name } = await City.findOne({ _id: req.params.cityId });
    const listings = await Listing.find({ city: req.params.cityId }, 'listingId listingUrl listingStartDate scraped');
    res.render('admin/listings', { listings, city: name });
  } catch (error) {
    next(error);
  }
}
