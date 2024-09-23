const Crop = require("./models/crop.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { signupSchema, validateCrop, reviewSchema } = require("./schema.js"); // Corrected 'singup' to 'signup'

module.exports.validateSignup = (req, res, next) => {
    console.log('Validating signup data...');  // Debugging step
    const { error } = signupSchema.validate(req.body); // Corrected here as well
    if (error) {
        console.log('Validation error:', error.details[0].message);  // Debugging step
        req.flash("error", error.details[0].message);
        return res.redirect("/signup");
    }
    next();
};

module.exports.validateCrop = (req, res, next) => {  // Updated the name for clarity
    const { id } = req.params;

    const { error } = validateCrop.validate(req.body);

    if (error) {
        req.flash("error", error.details[0].message); // or handle the error as needed
        console.log(error);
        return res.redirect(`/profile/${id}`);
    }

    next();
};

module.exports.validatereview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    console.log(error);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
}