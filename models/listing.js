const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  listingId: { type: Number, default: null },
  listingUrl: { type: String, default: null },
  listingStartDate: { type: Date, default: null },
  city: { type: Schema.Types.ObjectId, ref: 'City' }
});

module.exports = mongoose.model('Listing', listingSchema);
