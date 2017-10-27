const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const propertySchema = new Schema({
  amountIncludingFees: { type: Number, default: null },
  cleaningFee: { type: Number, default: null },
  securityDeposit: { type: Number, default: null },
  extraPeopleFee: { type: Number, default: null },
  currency: { type: String, default: null },
  bedrooms: { type: Number, default: null },
  country: { type: String, default: null },
  city: { type: String, default: null },
  roomType: { type: String, default: null },
  starRating: { type: Number, default: null },
  monthlyDiscount: { type: Number, default: null },
  extraPeopleCharge: { type: Number, default: null },
  listingLat: { type: Number, default: null },
  listingLng: { type: Number, default: null },
  checkIn: { type: Date, default: null },
  checkOut: { type: Date, default: null }
});

const listings = new Schema({
  listingId: { type: Number, default: null },
  listingUrl: { type: String, default: null },
  listingInfoForRange: [propertySchema]
});

const citySchema = new Schema({
  listings: [listings],
  city: { type: String, default: null },
});

module.exports = mongoose.model('city', citySchema);
