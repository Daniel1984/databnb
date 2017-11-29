const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const neighborhoodSchema = new Schema({
  name: { type: String, default: null },
  listings_count: { type: Number, default: null },
  city: { type: Schema.Types.ObjectId, ref: 'City', index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

module.exports = mongoose.model('Neighborhood', neighborhoodSchema);
