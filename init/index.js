const mongoose = require("mongoose");
const initData = require("./data.js");
const cropListing = require("../models/cropsListing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/AgriHub";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await cropListing.deleteMany({});
  // initData.data = initData.data.map((obj) => ({ ...obj, owner: "66b4ee1814ff6d0d6d67d0ba" }));
  await cropListing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();