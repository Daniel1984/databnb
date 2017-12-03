const Listing = require('../../models/listing');
const ListingAvailability = require('../../models/listingAvailability');
const { getAvailabilityUrl } = require('../../scripts/utils');
const getListingAvailabilities = require('../../scripts/listingAvailabilityScraper');

module.exports = async (req, res, next) => {
  res.status(200).json({ msg: 'getting availability' });

  const { cityId } = req.params;

  const listings = await Listing
    .find({ city_id: cityId })
    .where('availability_checked_at')
    .eq(null);
    // .where({
    //   $or: [
    //     { availability_checked_at: null },
    //     { where: { $lt: new Date(2011, 12, 12) }}
    //   ]
    // })

  while (listings.length) {
    const { id: listingId, _id: listingDbId, city_id, neighborhood_id } = listings.shift();
    const availabilityUrl = getAvailabilityUrl({ listingId });
    const availabilityMonths = await getListingAvailabilities(availabilityUrl);

    availabilityMonths.forEach(({ days = [] }) => {
      days.forEach((day) => {
        ListingAvailability.create({ ...day, listing_id: listingDbId, city_id, neighborhood_id });
      });
    });

    await Listing.findByIdAndUpdate(listingDbId, { availability_checked_at: new Date() });
  }

  console.log('DONE SEARCHING AVAILABILITIES');
}
