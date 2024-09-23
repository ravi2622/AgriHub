if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

const express = require("express");
const app = express();
const port = 5000;
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const User = require("./models/user.js");
const cropsListing = require("./models/cropsListing.js");
const Crop = require("./models/crop.js");
const Review = require('./models/review.js');
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const calculateAvgRating = require("./utils/calculateAvgRating.js");
const ExpressError = require("./utils/ExpressError.js");
const { validateSignup, validateCrop, validatereview } = require("./middleware.js");
const multer = require('multer');
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bodyParser = require('body-parser');

main().then(res => console.log("Connecstion Successful"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/AgriHub');
};

app.listen(port, (req, res) => {
    console.log(`The port will be listune at port - '${port}'`);
});

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // For parsing JSON payloads
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
    res.send("welcome to the FarmHub :)");
});

const sesstionOpstion = {
    secret: 'mysupersecretstring',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
        maxAge: 1000 * 60 * 24 * 3,
        httpOnly: true
    },
};

app.use(session(sesstionOpstion));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;

    // console.log(res.locals.success);
    // console.log(res.locals.error);

    next();
});

app.get("/signup", (req, res) => {
    res.render("./user/singup.ejs");
});

app.post("/signup", upload.single('profilepicture'), validateSignup, wrapAsync(async (req, res) => {
    try {
        const { username, email, password, mobilenumber, role, location, country } = req.body;
        console.log(req.body);
        const newUser = new User({ email, username, mobilenumber, role, location, country });

        // Check if file upload exists
        if (req.file) {
            const url = req.file.path;
            const filename = req.file.filename;
            newUser.profilepicture = { url, filename };
        }

        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/home");
        });

    } catch (error) {
        console.error(error.message);
        req.flash("error", error.message);
        res.redirect("/signup");
    }
}));

app.get("/login", (req, res) => {
    res.render("./user/login.ejs");
});

app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}), wrapAsync(async (req, res, next) => { // Added 'next'
    try {
        console.log(req.user);
        req.flash("success", "Welcome to Wanderlust! You are logged in!");
        let redirectUrl = "/home";
        res.redirect(redirectUrl);
    } catch (err) {
        next(err); // If any error occurs, it will be passed to the error handler middleware
    }
}));


app.get("/logout", (req, res, next) => { // Added 'next'
    req.logout((err) => {
        if (err) {
            return next(err); // Ensure 'next' is available for handling errors
        }
        req.flash("success", "Logged you out");
        res.redirect("/home");
    });
});

app.get("/profile/:id", async (req, res) => {
    let { id } = req.params;

    console.log(`this is a user name :===== ${req.user.username}`);
    let profileDetails = await User.findById(id);
    console.log(profileDetails);

    let userCrops = await User.findById(id).populate("addcroplisting");
    console.log(userCrops);

    res.render("./ProfilePage/profile.ejs", { profileDetails, userCrops });
});

app.get("/profile/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;

    // Fetch the user details based on the ID
    let profileDetails = await User.findById(id);
    console.log(profileDetails);

    // Pass the fetched user data to the EJS template
    res.render("./ProfilePage/edit.ejs", { profileDetails });
}));


app.put("/profile/:id", upload.single('data[profilepicture]'), wrapAsync(async (req, res) => {
    // const userId = req.user._id;
    const { userId } = req.params;

    // If there is a new file (profile picture) uploaded
    if (req.file) {
        const url = req.file.path;
        const filename = req.file.filename;

        // Update profilepicture field with new URL and filename
        await User.findByIdAndUpdate(userId, {
            'profilepicture.url': url,
            'profilepicture.filename': filename
        });
        console.log(`Updated profile picture URL: ${url}, filename: ${filename}`);
    }

    // Update other user data (from req.body)
    if (req.body.data) {
        await User.findByIdAndUpdate(userId, { ...req.body.data });
        console.log(`Updated user data: ${JSON.stringify(req.body.data)}`);
    }

    // Redirect to profile page after update
    res.redirect(`/profile/${userId}`);
}));

app.post("/profile/:id/addcrops", upload.single('cropdata[image]'), validateCrop, wrapAsync(async (req, res) => {
    console.log(req.body.cropdata);

    let url = req.file ? req.file.path : '';
    let filename = req.file ? req.file.filename : '';
    console.log(url, "..", filename);

    let newCropListing = new Crop(req.body.cropdata);

    if (url) {
        newCropListing.image = { url, filename };
    }

    // Set the owner of the crop listing
    newCropListing.owner = req.user._id;

    // Find crop listing based on crop name
    let croplisting = await cropsListing.find({ name: req.body.cropdata.name });

    if (croplisting.length > 0) {
        // If croplisting is found, add the new crop to the listing
        croplisting.forEach(async function (el) {
            el.addcroplisting.push(newCropListing);

            // Save each individual croplisting document
            await el.save().then(res => {
                console.log('Updated croplisting:', res);
            }).catch(err => {
                console.log('Error updating croplisting:', err);
            });
        });
    } else {
        // If no croplisting is found
        console.log('No croplisting found');
    }

    // Save the new crop listing to MongoDB
    await newCropListing.save().then(async savedCrop => {
        console.log('New crop listing saved:', savedCrop);

        // Now, add the saved crop's ID to the user's `addcroplisting` array
        const user = await User.findById(req.user._id);

        if (user) {
            user.addcroplisting.push(savedCrop._id); // Add the crop ID to the user's crop listing array
            await user.save().then(updatedUser => {
                console.log('User updated with new crop:', updatedUser);
            }).catch(err => {
                console.log('Error updating user with new crop:', err);
            });
        }
    }).catch(err => {
        console.log('Error saving new crop listing:', err);
    });

    // Redirect or respond after successful submission
    res.redirect(`/profile/${req.params.id}`);
}));


app.get("/home", async (req, res) => {
    let cropCount = await cropsListing.countDocuments();
    console.log(cropCount);

    res.render("./HomePage/home.ejs", { cropCount });
});

app.get("/cropslisting", async (req, res) => {
    let kharifCrops = await cropsListing.find({ season: 'Kharif' });
    let RabiCrops = await cropsListing.find({ season: 'Rabi' });
    let CashCrops = await cropsListing.find({ season: 'Cash Crop' });
    let ZaidCrops = await cropsListing.find({ season: 'Zaid' });


    res.render("./listings/listing.ejs", { kharifCrops, RabiCrops, CashCrops, ZaidCrops });
});


app.get("/cropslisting/:id/:name", wrapAsync(async (req, res) => {
    const { id, name } = req.params;

    console.log(`ID: ${id}, Name: ${name}`);

    // Find the crop listing by its ID and populate the related crops
    const croplisting = await cropsListing.findById(id).populate("addcroplisting");

    // Check if the crop listing or the populated crops exist
    if (!croplisting || croplisting.addcroplisting.length === 0) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/cropslisting");
    }

    // Find specific crop by name (if necessary, else crop might be unused)
    const crop = await Crop.findOne({ name });

    console.log("Addcroplisting:", croplisting);

    // Render the page with the found listing
    return res.render("./listings/individual.ejs", { croplisting });
}));

app.get("/cropslisting/:id/:name/:cropId", wrapAsync(async (req, res) => {
    let { id, cropId, name } = req.params;

    let product = await Crop.findById(cropId);
    console.log(product);
    let crop = await cropsListing.findById(id);
    console.log(crop);
    let farmer = await User.findById(product.owner);
    let similarProducts = await Crop.find({ name: name });

    console.log(farmer);

    const reviews = await Review.find(); // Fetch all reviews from MongoDB
    console.log(reviews);
    const avgRating = await calculateAvgRating();
    console.log(avgRating);
    const ratingCounts = {
        5: await Review.countDocuments({ rating: 5 }),
        4: await Review.countDocuments({ rating: 4 }),
        3: await Review.countDocuments({ rating: 3 }),
        2: await Review.countDocuments({ rating: 2 }),
        1: await Review.countDocuments({ rating: 1 })
      };

    res.render("./listings/show.ejs", { crop, product, farmer, similarProducts, avgRating, ratingCounts, reviews });
}));

app.post('/cropslisting/:id/:name/:cropId/submitreview', validatereview, async (req, res) => {
    const { id, name, cropId } = req.params;
    let crop = await Crop.findById(cropId);
    const rating = parseInt(req.body.rating);
    console.log(rating);
    const comment = req.body.comment;
    console.log(comment);
  
    // Save the review to MongoDB
    const newReview = new Review({ rating, comment });
    newReview.author = req.user._id;

    console.log(newReview);
    console.log("this is a crop listing := ", crop);

    crop.reviews.push(newReview);

    await newReview.save().then(res => { console.log(res) }).catch(err => { console.log(err) });
    await crop.save().catch(err => { console.log(err) });

    console.log("new review save!");
    req.flash("success", "New Review Created!");
  
    // Redirect back to the main page
    res.redirect(`/cropslisting/${id}/${name}/${cropId}`);
});

// module.exports.destroyReview = async (req, res) => {
//     let { id, reviewsId } = req.params;

//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewsId } }).then(res => { console.log(res) }).catch(err => { console.log(err) });
//     await Review.findByIdAndDelete(reviewsId);

//     req.flash("success", "Successfuly Review Deleted!");

//     res.redirect(`/listings/${id}`);
// };

app.all("*", (req, res, next) => {
    console.log("new error!");
    throw new ExpressError(404, "Page Not Found!");
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong!" } = err;
    console.log(err.message);

    res.status(statusCode).render("./errors.ejs", { err });

    // res.status(statusCode).send(message);
});