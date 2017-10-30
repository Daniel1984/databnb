const City = require('../../models/city');
const Listing = require('../../models/listing');

module.exports = {
  index: async (req, res, next) => {
    try {
      const cities = await City.find();
      res.render('admin/cities', { cities });
    } catch (error) {
      next(error);
    }
  },

  show: async (req, res, next) => {
    try {
      const { name } = await City.findOne({ _id: req.params.cityId });
      const listings = await Listing.find({ city: req.params.cityId }, 'listingId listingUrl listingStartDate');
      res.render('admin/listings', { listings, city: name });
    } catch (error) {
      next(error);
    }
  }
}
