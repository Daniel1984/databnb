const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    default: null,
    required: [true, 'Email is equired'],
    validate: {
      validator: (v) => {
        const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(v);
      },
      message: '{VALUE} is not a valid email!',
    },
  },
  password: {
    type: String,
    default: null,
    min: [6, 'Password too weak'],
    required: [true, 'Password is required'],
  },
  telephoneNumber: { type: String, default: null },
  fullName: { type: String, default: null },
  address: { type: String, default: null },
  confirmedEmail: { type: Boolean, default: false },
  plan: { type: String, default: 'free' },
  planUpdatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  activeAccount: { type: Boolean, default: true },
});

module.exports = mongoose.model('User', userSchema);
