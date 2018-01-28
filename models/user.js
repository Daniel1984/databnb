
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriberSchema = new Schema({
  email: {
    type: String,
    unique: true,
    default: null,
    required: [true, 'Email is equired'],
    validate: {
      validator: (v) => {
        const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(v);
      },
      message: '{VALUE} is not a valid email!'
    },
  },
  password: {
    type: String,
    default: null,
    min: [6, 'Password too weak'],
    required: [true, 'Password is required']
  },
  telephoneNumber: { type: String, default: null },
  fullName: { type: String, default: null },
  address: { type: String, default: null },
  confirmedEmail: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
