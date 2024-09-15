const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cropsListingSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    season: {
        type: String,
        enum: ['Kharif', 'Zaid', 'Cash Crop', 'Rabi'],
    },
    croptype: {
        type: String,
    },
    image: {
        type: String,
        default: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2MjI1MjI0NDQ0MzYzMjM4Mg%3D%3D/original/ae3426d1-fba4-44d4-bed2-690426f25f7a.jpeg?im_w=1440&im_q=highq",
        set: (v) => v === "" ? "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTE2MjI1MjI0NDQ0MzYzMjM4Mg%3D%3D/original/ae3426d1-fba4-44d4-bed2-690426f25f7a.jpeg?im_w=1440&im_q=highq" : v,
    },
});

const cropsListing = mongoose.model("CropsListing", cropsListingSchema);

module.exports = cropsListing;