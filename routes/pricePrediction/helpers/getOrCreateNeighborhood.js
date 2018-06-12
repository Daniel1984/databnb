const Neighborhood = require('../../../models/neighborhood');

module.exports = async function getOrCreateNeighborhood(name) {
  let neighborhood = await Neighborhood.findOne({ name });

  if (!neighborhood) {
    neighborhood = await Neighborhood.create({ name });
  }

  return neighborhood;
};
