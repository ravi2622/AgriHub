const express = require("express");
const app = express();
const mongoose = require("mongoose");
const initData  = require("./data.js");
const cropListing = require("../models/cropsListing.js");
const port = 3000;

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

app.listen(port, (req, res) => {
  console.log(`The port will be listune at port - '${port}'`);
});

const initDB = async (req, res) => {
  // await cropListing.deleteMany({});
  // // initData.data = initData.data.map((obj) => ({ ...obj, owner: "66b4ee1814ff6d0d6d67d0ba" }));
  // await cropListing.insertMany(initData.data);
  // console.log("data was initialized");

  // console.log(...initData.data);

  // let data = ...initData.data;

  let name = [];

  let DATA = initData.data.forEach((el) => {
    name.push(el.name);

    // console.log(el.name);
  });

  console.log(name);

  res.send(name);
};

// initDB();

app.get("/", initDB);