const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  id: { type: Number, default: null },
  is_business_travel_ready: { type: Boolean, default: null },
  is_family_preferred: { type: Boolean, default: null },
  is_new_listing: { type: Boolean, default: null },
  is_superhost: { type: Boolean, default: null },
  lat: { type: Number, default: null, index: true  },
  lng: { type: Number, default: null, index: true  },
  localized_city: { type: String, default: null },
  localized_neighborhood: { type: String, default: null },
  name: { type: String, default: null },
  person_capacity: { type: Number, default: null },
  picture_count: { type: Number, default: null },
  reviews_count: { type: Number, default: null },
  room_type: { type: String, default: null },
  space_type: { type: String, default: null },
  star_rating: { type: Number, default: null },
  listing_start_date: { type: Date, default: null },
  has_start_date: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
  has_pricing_history: { type: Boolean, default: false },
  neighborhood: { type: Schema.Types.ObjectId, ref: 'Neighborhood', index: true },
  city: { type: Schema.Types.ObjectId, ref: 'City', index: true },
});

module.exports = mongoose.model('Listing', listingSchema);
