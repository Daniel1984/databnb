const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingHistorySchema = new Schema({
  amount_including_fees: { type: Number, default: null },
  cleaning_fee: { type: Number, default: null },
  security_deposit: { type: Number, default: null },
  extra_people_fee: { type: Number, default: null },
  currency: { type: String, default: null },
  bedrooms: { type: Number, default: null },
  country: { type: String, default: null },
  city: { type: String, default: null },
  room_type: { type: String, default: null },
  star_rating: { type: Number, default: null },
  monthly_discount: { type: Number, default: null },
  extra_people_charge: { type: Number, default: null },
  listing_lat: { type: Number, default: null },
  listing_lng: { type: Number, default: null },
  check_in: { type: Date, default: null },
  check_out: { type: Date, default: null },
  listing: { type: Schema.Types.ObjectId, ref: 'Listing', index: true },
});

module.exports = mongoose.model('ListingHistrory', listingHistorySchema);
