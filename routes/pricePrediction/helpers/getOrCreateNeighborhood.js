const Neighborhood = require('../../../models/neighborhood');

module.exports = async function getOrCreateNeighborhood(name) {
  let neighborhood = await Neighborhood.findOne({ name });

  if (!neighborhood) {
    try {
      neighborhood = await Neighborhood.create({ name });
    } catch (error) {
      neighborhood = { name }; // no matter what return at least literal with name for scraping
    }
  }

  return neighborhood;
};
