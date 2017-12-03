const Listing = require('../../models/listing');
const PricingHistory = require('../../models/pricingHistory');
const Neighborhood = require('../../models/neighborhood');
const getPropertyPaymentData = require('../../scripts/propertyPaymentScraper');
const { getListingPaymentUrl, getDatesToFetch } = require('../../scripts/utils');

module.exports = async (req, res, next) => {
  const { cityId } = req.params;

  if (!cityId) {
    res.status(200).json({ msg: 'cityId must be present' });
    return;
  }

  const neighborhoods = await Neighborhood.find({ city: cityId });

  if (!neighborhoods.length) {
    res.status(200).json({ msg: 'no neighborhoods found' });
    return;
  }

  res.status(200).json({ msg: 'getting pricing history for all city hoods' });

  do {
    let hasPricingInfo;
    const { _id: hoodId } = neighborhoods.shift();

    const listings = await Listing.find({
      pricing_checked_at: null,
      city: cityId,
      neighborhood: hoodId
    });

    do {
      const { id: listingId, _id: listingDbId, listing_start_date } = listings.shift();
      const datesToFetch = getDatesToFetch(listing_start_date);
      hasPricingInfo = false;

      do {
        const { checkIn, checkOut } = datesToFetch.shift();
        const propertyPaymentData = await getPropertyPaymentData(getListingPaymentUrl({ listingId, checkIn, checkOut }));

        if (propertyPaymentData) {
          hasPricingInfo = true;

          await PricingHistory.create({
            ...propertyPaymentData,
            check_in: checkIn,
            check_out: checkOut,
            city: cityId,
            neighborhood: hoodId,
            listing: listingDbId,
          });
        }
      } while (datesToFetch.length);

      if (hasPricingInfo) {
        await Listing.findByIdAndUpdate(listingDbId, { pricing_checked_at: Date.now });
      }
    } while (listings.length);
  } while (neighborhoods.length);

  console.log('DONE FETCHING PAYMENT');
}