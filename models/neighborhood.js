const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const neighborhoodSchema = new Schema({
  name: { type: String, default: null },
  listingsScrapedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  locked: { type: Boolean, default: false },
});

module.exports = mongoose.model('Neighborhood', neighborhoodSchema);
