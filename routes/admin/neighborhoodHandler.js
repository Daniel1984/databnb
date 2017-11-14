const Neighborhood = require('../../models/neighborhood');

module.exports = async (req, res, next) => {
  const { cityId: city } = req.params;

  const desiredFields = `
    name
    _id
    city
    listings_count
  `;

  try {
    const neighborhoods = await Neighborhood.find({ city }, desiredFields);
    res.render('admin/neighborhoods', { neighborhoods });
  } catch (error) {
    next(error);
  }
}
