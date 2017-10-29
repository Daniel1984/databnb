const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citySchema = new Schema({
  cityPath: { type: String, default: null },
  name: { type: String, default: null }
});

module.exports = mongoose.model('City', citySchema);
