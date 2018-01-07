const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingAvailabilitySchema = new Schema({
  available: { type: Boolean, default: null },
  date: { type: Date, default: null },
  price: {
    date: { type: Date, default: null },
    local_adjusted_price: { type: Number, default: null },
    local_currency: { type: String, default: null },
    local_price: { type: Number, default: null },
    native_adjusted_price: { type: Number, default: null },
    native_price: { type: Number, default: null },
    native_currency: { type: String, default: null },
    type: { type: String, default: null },
  },
  neighborhood_id: { type: Schema.Types.ObjectId, ref: 'Neighborhood', index: true },
  listing_id: { type: Schema.Types.ObjectId, ref: 'Listing', index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

module.exports = mongoose.model('ListingAvailability', listingAvailabilitySchema);
