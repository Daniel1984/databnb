const request = require('request');
const Neighborhood = require('../../models/neighborhood');
const Listing = require('../../models/listing');
const suburbs = require('../../suburbs.json');
const getListingsInfo = require('../../scripts/listingInfoScraper');

module.exports = async (req, res, next) => {
  const { city } = req.query;
  const citySuburbs = suburbs[city];

  res.status(200).json({ msg: `started getting listings for ${city}.`});

  while (citySuburbs.length) {
    const suburb = citySuburbs.shift();
    const listings = await getListingsInfo({ suburb, city });
    let suburbModel = await Neighborhood.findOne({ name: suburb });

    if (!suburbModel) {
      suburbModel = await Neighborhood.create({ name: suburb });
    }

    while (listings.length) {
      const { listing } = listings.shift();
      const updatedListing = await Listing.findOneAndUpdate({ id: listing.id }, listing);

      if (!updatedListing) {
        await Listing.create({ ...listing, neighborhood_id: suburbModel._id });
      }
    }
  }
}
