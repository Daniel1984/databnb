const City = require('../../models/city');

module.exports = async (req, res, next) => {
  try {
    const cities = await City.find();
    res.render('admin/cities', { cities });
  } catch (error) {
    next(error);
  }
}
