const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingHistorySchema = new Schema({
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
  listing: { type: Schema.Types.ObjectId, ref: 'Listing' },
});

module.exports = mongoose.model('ListingHistrory', listingHistorySchema);
