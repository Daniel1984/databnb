const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  id: { type: Number, default: null },
  is_new_listing: { type: Boolean, default: null },
  is_superhost: { type: Boolean, default: null },
  lat: { type: Number, default: null, index: true  },
  lng: { type: Number, default: null, index: true  },
  bedrooms: { type: Number, default: null },
  beds: { type: Number, default: null },
  localized_city: { type: String, default: null },
  localized_neighborhood: { type: String, default: null },
  name: { type: String, default: null },
  // neighborhood: { type: String, default: null },
  person_capacity: { type: Number, default: null },
  picture_url: { type: String, default: null },
  picture_count: { type: Number, default: null },
  reviews_count: { type: Number, default: null },
  room_type: { type: String, default: null },
  space_type: { type: String, default: null },
  star_rating: { type: Number, default: null },
  listing_start_date: { type: Date, default: null },
  availability_checked_at: { type: Date, default: null },
  neighborhood_id: { type: Schema.Types.ObjectId, ref: 'Neighborhood' },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  geo: {
    type: {
      type: String,
      enum: ['Point', 'LineString', 'Polygon'],
      default: 'Point',
    },
    coordinates: {
      type: Schema.Types.Mixed,
      default: [0, 0],
    },
  },
});

listingSchema.index({ geo: '2dsphere' });

module.exports = mongoose.model('Listing', listingSchema);
