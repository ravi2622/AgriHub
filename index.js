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
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { singupSchemaValidation, cropValidationSchema } = require("./middleware.js");
const multer = require('multer');
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

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
app.use(express.json());
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

// Remove or correct this route
app.get("/singup", (req, res) => {
    res.render("./user/singup.ejs");
});

app.post("/singup", upload.single('profilepicture'), singupSchemaValidation, wrapAsync(async (req, res) => {
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
}), wrapAsync(async (req, res) => {
    console.log(req.user);
    req.flash("success", "Welcome to Wanderlust! You are logged in!");
    let redirectUrl = "/home";
    res.redirect(redirectUrl);
}));

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "logged you out");
        res.redirect("/home");
    });
});

app.get("/profile/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;

    console.log(req.user.username);
    let profileDetails = await User.find({ _id: req.user._id });
    console.log(profileDetails);

    res.render("./ProfilePage/profile.ejs", { profileDetails });
}));

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

app.post("/profile/:id/addcrops", upload.single('cropdata[image]'), cropValidationSchema, wrapAsync(async (req, res) => {

    console.log(req.body.cropdata);
    let url = req.file ? req.file.path : '';
    let filename = req.file ? req.file.filename : '';
    console.log(url, "..", filename);
    let newCropListing = new Crop(req.body.cropdata);
    if (url) {
        newCropListing.image = { url, filename };
    }
    newCropListing.owner = req.user._id;

    console.log(newCropListing);

    // Save the crop to MongoDB
    newCropListing.save().then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    });

    // Redirect or respond after successful submission
    res.redirect(`/profile/${req.params.id}`);
}));


app.get("/home", (req, res) => {
    res.render("./HomePage/home.ejs");
});

app.get("/cropslisting", async (req, res) => {
    let kharifCrops = await cropsListing.find({ season: 'Kharif' });
    let RabiCrops = await cropsListing.find({ season: 'Rabi' });
    let CashCrops = await cropsListing.find({ season: 'Cash Crop' });
    let ZaidCrops = await cropsListing.find({ season: 'Zaid' });


    res.render("./listings/listing.ejs", { kharifCrops, RabiCrops, CashCrops, ZaidCrops });
});

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