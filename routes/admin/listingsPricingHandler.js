const Listing = require('../../models/listing');
const PricingHistory = require('../../models/pricingHistory');
const Neighborhood = require('../../models/neighborhood');
const getPropertyPaymentData = require('../../scripts/propertyPaymentScraper');
const { getListingPaymentUrl, getDatesToFetch } = require('../../scripts/utils');

module.exports.getNeighborhoodPayments = async (req, res, next) => {
  res.status(200).json({ msg: 'getting pricing history' });

  const { cityId, hoodId } = req.params;

  const listings = await Listing.find({
    has_pricing_history: false,
    city: cityId,
    neighborhood: hoodId
  });


  if (!listings.length) {
    console.log('NO LISTINGS FOUND!');
    return;
  }

  let hasPricingInfo;
  let listingDbId;

  do {
    const { id, _id, listing_start_date } = listings.shift();
    const datesToFetch = getDatesToFetch(listing_start_date);

    hasPricingInfo = false;
    listingDbId = _id;

    do {
      const { checkIn, checkOut } = datesToFetch.shift();
      const propertyPaymentData = await getPropertyPaymentData(getListingPaymentUrl({ listingId: id, checkIn, checkOut }));

      if (propertyPaymentData) {
        hasPricingInfo = true;

        await PricingHistory.create({
          ...propertyPaymentData,
          check_in: checkIn,
          check_out: checkOut,
          city: cityId,
          neighborhood: hoodId,
          listing: _id,
        });
      }
    } while (datesToFetch.length);

    if (hasPricingInfo) {
      await Listing.findByIdAndUpdate(listingDbId, { has_pricing_history: true });
    }
  } while (listings.length);

  console.log('DONE FETCHING PAYMENT');
}


module.exports.getCityPayments = async (req, res, next) => {
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
      has_pricing_history: false,
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
        await Listing.findByIdAndUpdate(listingDbId, { has_pricing_history: true });
      }
    } while (listings.length);
  } while (neighborhoods.length);

  console.log('DONE FETCHING PAYMENT');
}
