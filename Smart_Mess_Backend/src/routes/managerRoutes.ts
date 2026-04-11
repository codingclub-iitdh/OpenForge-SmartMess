import express from "express";

const router = express.Router();
import {
	createNewFoodItem, addTimeTable, makeAnnouncements, floatFeedbackForm, getAllFeedbackForms, getFeedbackFormSubmissions,
	deleteTimeTableHandler, managerTimeTable, getAllFoodItems, getItemRating, getTimeSeries, addTimeSeries,
	updateFoodItem, deleteFoodItem
} from "../controllers/manager.controller";

import { checkRoles } from "../middlewares/checkRoles";

// View permissions (Dean, Manager, Secy)
const viewAccess = checkRoles(["manager", "secy", "dean"]);
// Edit Menu permissions (Manager, Secy)
const editMenuAccess = checkRoles(["manager", "secy"]);

// GET Routes
router.get("/dashboard/allFeedbackForms", viewAccess, getAllFeedbackForms);
router.get("/dashboard/feedbackFormSubmissions/:formID", viewAccess, getFeedbackFormSubmissions);
router.get("/dashboard/timetable", viewAccess, managerTimeTable);
router.get("/dashboard/allFoodItems", viewAccess, getAllFoodItems);
router.get("/dashboard/getTimeSeries", viewAccess, getTimeSeries);

// POST Routes
router.post("/dashboard/makeAnnouncement", viewAccess, makeAnnouncements);
router.post("/dashboard/floatFeedbackForm", viewAccess, floatFeedbackForm);
router.post("/dashboard/getItemRating", viewAccess, getItemRating);
router.post("/dashboard/addTimeSeries", viewAccess, addTimeSeries);

// PUT Routes
router.put("/dashboard/createFoodItem", editMenuAccess, createNewFoodItem);

// Patch Routes
router.patch("/dashboard/addTimeTable", editMenuAccess, addTimeTable);
router.patch("/dashboard/updateFoodItem", editMenuAccess, updateFoodItem);

// DELETE Routes
router.delete("/dashboard/deleteTimeTable", editMenuAccess, deleteTimeTableHandler);
router.delete("/dashboard/deleteFoodItem/:id", editMenuAccess, deleteFoodItem);

export default router;
