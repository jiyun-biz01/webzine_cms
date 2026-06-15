import { Router } from "express";
import * as settingsController from "../controllers/settingsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/",  authMiddleware, settingsController.getSettings);
router.put("/",  authMiddleware, settingsController.updateSettings);

export default router;
