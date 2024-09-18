const { singupSchemaValidation, cropValidationSchema } = require("./schema.js");

module.exports.singupSchemaValidation = (req, res, next) => {

    const { error } = singupSchemaValidation.validate(req.body);

    if (error) {
        req.flash("error", error.details[0].message); // or handle the error as needed
        return res.redirect("/signup");
    }
    
    next();
};

module.exports.cropValidationSchema = (req, res, next) => {

    const { id } = req.params;

    const { error } = cropValidationSchema.validate(req.body);

    if (error) {
        req.flash("error", error.details[0].message); // or handle the error as needed
        console.log(error);
        return res.redirect(`/profile/${id}`);
    }
    
    next();
};