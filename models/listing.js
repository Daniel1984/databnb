const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  listingId: { type: Number, default: null },
  listingUrl: { type: String, default: null },
  listingStartDate: { type: Date, default: null },
  scraped: { type: Boolean, default: false },
  city: { type: Schema.Types.ObjectId, ref: 'City', index: true }
});

module.exports = mongoose.model('Listing', listingSchema);
