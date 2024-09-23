const Review = require('../models/review.js');

// Helper function to calculate average rating
const calculateAvgRating = async () => {
    const reviews = await Review.find();
    if (reviews.length === 0) return 0;
    const totalRatings = reviews.length;
    const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (sumRatings / totalRatings).toFixed(1);
};

module.exports = calculateAvgRating;