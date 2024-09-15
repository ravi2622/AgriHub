const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userShema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  mobilenumber: { type: Number, required: true},
  profilepicture: {
    // type: String,
    // default: "https://publicdomainvectors.org/tn_img/abstract-user-flat-4.webp",
    // set: (v) => v === "" ? "https://publicdomainvectors.org/tn_img/abstract-user-flat-4.webp" : v,

    url: String,
    filenme: String,
  },
  role: { type: String, enum: ['farmer', 'retailer'], default: 'farmer' },
  createdAt: { type: Date, default: Date.now },
  location: { type: String, required: true, },
  country: { type: String, required: true, },
});

userShema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userShema);
