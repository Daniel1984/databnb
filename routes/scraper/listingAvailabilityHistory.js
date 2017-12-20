const Listing = require('../../models/listing');
const ListingAvailability = require('../../models/listingAvailability');
const { getAvailabilityUrl } = require('../../scripts/utils');
const getListingAvailabilities = require('../../scripts/listingAvailabilityScraper');

module.exports = {
  getListingAvailabilityHistory: async (req, res, next) => {
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
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() - 1;
      const { id: listingId, _id: listingDbId, city_id, neighborhood_id } = listings.shift();
      const availabilityUrl = getAvailabilityUrl({ listingId, year, month });
      const availabilityMonths = await getListingAvailabilities(availabilityUrl);

      availabilityMonths.forEach(({ days = [] }) => {
        days.forEach((day) => {
          ListingAvailability.create({ ...day, listing_id: listingDbId, city_id, neighborhood_id });
        });
      });

      await Listing.findByIdAndUpdate(listingDbId, { availability_checked_at: new Date() });
    }

    console.log('DONE CREATING AVAILABILITIES');
  },

  updateListingAvailabilityHistory: async (req, res, next) => {
    res.status(200).json({ msg: 'getting availability' });
    const { cityId } = req.params;

    const listings = await Listing
      .find({ city_id: cityId })
      .select('id city_id neighborhood_id availability_checked_at');

    while (listings.length) {
      const {
        id: listingId,
        _id: listingDbId,
        city_id,
        neighborhood_id,
        availability_checked_at
      } = listings.shift();

      const year = availability_checked_at.getFullYear();
      const month = availability_checked_at.getMonth() + 1;
      const availabilityUrl = getAvailabilityUrl({ listingId, year, month });
      const availabilityMonths = await getListingAvailabilities(availabilityUrl);

      while (availabilityMonths.length) {
        const { days = [] } = availabilityMonths.shift();

        while (days.length) {
          const day = days.shift();

          const availability = await ListingAvailability.findOneAndUpdate({
            listing_id: listingDbId,
            date: day.date,
          }, { ...day, updatedAt: Date.now() });

          if (!availability) {
            await ListingAvailability.create({ ...day, listing_id: listingDbId, city_id, neighborhood_id })
          }
        }
      }

      await Listing.findByIdAndUpdate(listingDbId, { availability_checked_at: Date.now() });
    }

    console.log('DONE UPDATING AVAILABILITIES');
  },
}
