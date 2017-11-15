const Listing = require('../../models/listing');
const ListingAvailability = require('../../models/listingAvailability');
const { getAvailabilityUrl } = require('../../scripts/utils');
const getListingAvailabilities = require('../../scripts/listingAvailabilityScraper');

module.exports = async (req, res, next) => {
  const { cityId: city } = req.params;

  const listings = await Listing
    .find({ city })
    .where('last_time_checked_availability').eq(null)
    .limit(1);
    // .where({
    //   $or: [
    //     { last_time_checked_availability: null },
    //     { where: { $lt: new Date(2011, 12, 12) }}
    //   ]
    // })

  while (listings.length) {
    const { id: listingId, _id, city, neighborhood } = listings.shift();
    const availabilityUrl = getAvailabilityUrl({ listingId });
    const availabilityMonths = await getListingAvailabilities(availabilityUrl);

    availabilityMonths.forEach(({ days = [] }) => {
      days.forEach((day) => {
        ListingAvailability.create({ ...day, listing: _id, city, neighborhood });
      });
    });
  }

  res.status(200).json({ msg: 'ok' });
}
