const Neighborhood = require('../../models/neighborhood');
const Listing = require('../../models/listing');

module.exports = async (req, res, next) => {
  const desiredFields = `
    name
    lat
    lng
    star_rating
    is_new_listing
    reviews_count
    _id
    has_pricing_history
  `;

  try {
    const { hoodId: neighborhood } = req.params;
    const { name } = await Neighborhood.findOne({ _id: neighborhood });
    const listings = await Listing.find({ neighborhood }, desiredFields);
    res.render('admin/listings', { listings, neighborhood: name });
  } catch (error) {
    next(error);
  }
}
