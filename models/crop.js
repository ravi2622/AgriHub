const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cropSchema = new Schema({
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
        type: String,
        default: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2MjI1MjI0NDQ0MzYzMjM4Mg%3D%3D/original/ae3426d1-fba4-44d4-bed2-690426f25f7a.jpeg?im_w=1440&im_q=highq",
        set: (v) => v === "" ? "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2MjI1MjI0NDQ0MzYzMjM4Mg%3D%3D/original/ae3426d1-fba4-44d4-bed2-690426f25f7a.jpeg?im_w=1440&im_q=highq" : v,
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
        type: schema.Types.ObjectId,
        ref: "Review",
    }],
    owner: {
        type: schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: { type: Date, default: Date.now },
});

const Crop = mongoose.model('Crop', cropSchema);

module.exports = Crop;
