const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citySchema = new Schema({
  city: { type: String, default: null },
  listingsUrl: { type: String, default: null },
  listings: [{
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  }]
});

module.exports = mongoose.model('City', citySchema);
