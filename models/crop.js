const { default: mongoose, set } = require("mongoose");
let Schema = mongoose.Schema;
const Review = require("./review.js");
const { string } = require("joi");
const User = require("./user.js");

const cropSchema = Schema({
    name: {
        type: String,
        required: true,
    },
    variety: {
        type: String,
    },
    plantedDate: {
        type: Date,
        required: true,
    },
    harvestDate: {
        type: Date,
    },
    quantity: {
        type: Number
    },
    unit: {
        type: String,
        enum: ['kg', 'liters', 'units'],
    },
    description: {
        type: String,
        // required: true,
    },
    image: {
        // type: String,
        // default: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2MjI1MjI0NDQ0MzYzMjM4Mg%3D%3D/original/ae3426d1-fba4-44d4-bed2-690426f25f7a.jpeg?im_w=1440&im_q=highq",
        // set: (v) => v === "" ? "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2MjI1MjI0NDQ0MzYzMjM4Mg%3D%3D/original/ae3426d1-fba4-44d4-bed2-690426f25f7a.jpeg?im_w=1440&im_q=highq" : v,

        url: String,
        filenme: String,

    },
    price: {
        type: Number,
        // required: true,
    },
    location: {
        type: String,
        // required: true,
    },
    country: {
        type: String,
        // required: true,
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review",
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: { type: Date, default: Date.now },
});

const Crop = mongoose.model('Crop', cropSchema);

module.exports = Crop;
