import { Router } from "express";
import * as notificationController from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/",              authMiddleware, notificationController.getNotifications);
router.patch("/read-all",    authMiddleware, notificationController.markAllAsRead);
router.patch("/:id/read",    authMiddleware, notificationController.markAsRead);

export default router;
