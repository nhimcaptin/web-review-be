const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review");

router.get("/", reviewController.getAllReviews);

router.get("/search", reviewController.searchReviews);

router.get("/outstanding", reviewController.getOutstandingReviews);

router.get("/user/:user", reviewController.getReviewsByUser);

router.get("/:id", reviewController.getReviewById);

router.post("/", reviewController.createReview);

router.put("/:id", reviewController.updateReview);

router.delete("/:id", reviewController.deleteReview);

router.post("/:id/like", reviewController.toggleLike);

module.exports = router;
