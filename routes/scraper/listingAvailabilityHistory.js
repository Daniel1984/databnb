const Listing = require('../../models/listing');
const ListingAvailability = require('../../models/listingAvailability');
const { getAvailabilityUrl } = require('../../scripts/utils');
const getListingAvailabilities = require('../../scripts/listingAvailabilityScraper');

module.exports = {
  getListingAvailabilityHistory: async (req, res, next) => {
    res.status(200).json({ msg: 'getting availability' });

    const listings = await Listing
      .where('availability_checked_at')
      .eq(null);

    while (listings.length) {
      const today = new Date();
      today.setMonth(today.getMonth() + 1);
      const year = today.getFullYear();
      const month = today.getMonth();

      const { id: listingId, _id: listingDbId, neighborhood_id } = listings.shift();
      const availabilityUrl = getAvailabilityUrl({ listingId, year, month });
      const availabilityMonths = await getListingAvailabilities(availabilityUrl);

      availabilityMonths.forEach(({ days = [] }) => {
        days.forEach((day) => {
          ListingAvailability.create({ ...day, listing_id: listingDbId, neighborhood_id });
        });
      });

      await Listing.findByIdAndUpdate(listingDbId, { availability_checked_at: new Date() });
    }

    console.log('DONE CREATING AVAILABILITIES');
  },

  updateListingAvailabilityHistory: async (req, res, next) => {
    res.status(200).json({ msg: 'getting availability' });

    const listings = await Listing
      .find()
      .select('id neighborhood_id availability_checked_at');

    while (listings.length) {
      const {
        id: listingId,
        _id: listingDbId,
        neighborhood_id,
        availability_checked_at
      } = listings.shift();

      const date = new Date(availability_checked_at);
      date.setMonth(date.getMonth() + 1);
      const year = date.getFullYear();
      const month = date.getMonth();
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
            await ListingAvailability.create({ ...day, listing_id: listingDbId, neighborhood_id })
          }
        }
      }

      await Listing.findByIdAndUpdate(listingDbId, { availability_checked_at: Date.now() });
    }

    console.log('DONE UPDATING AVAILABILITIES');
  },
}
