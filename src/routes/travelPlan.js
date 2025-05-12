const express = require("express");
const router = express.Router();

const {
  getAllTravelPlans,
  getTravelPlan,
  createTravelPlan,
  updateTravelPlan,
  deleteTravelPlan,
} = require("../controllers/travelPlan");

router.route("/").post(createTravelPlan).get(getAllTravelPlans);
router
  .route("/:id")
  .get(getTravelPlan)
  .delete(deleteTravelPlan)
  .patch(updateTravelPlan);

module.exports = router;
