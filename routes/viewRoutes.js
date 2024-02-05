const express = require("express");
const viewController = require("../controllers/viewController");

const router = express.Router();

router.use("/", viewController.getOverview);
router.use("/tour", viewController.getTour);

module.exports = router;