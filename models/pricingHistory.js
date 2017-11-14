const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pricingHistorySchema = new Schema({
  amount_including_fees: { type: Number, default: null },
  cleaning_fee: { type: Number, default: null },
  security_deposit: { type: Number, default: null },
  extra_people_fee: { type: Number, default: null },
  currency: { type: String, default: null },
  check_in: { type: Date, default: null },
  check_out: { type: Date, default: null },
  neighborhood: { type: Schema.Types.ObjectId, ref: 'Neighborhood', index: true },
  city: { type: Schema.Types.ObjectId, ref: 'City', index: true },
  listing: { type: Schema.Types.ObjectId, ref: 'Listing', index: true },
});

module.exports = mongoose.model('PricingHistory', pricingHistorySchema);
