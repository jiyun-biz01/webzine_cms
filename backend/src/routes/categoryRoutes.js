import { Router } from "express";
import * as categoryController from "../controllers/categoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", categoryController.getCategories);

router.post("/",      authMiddleware, categoryController.createCategory);
router.put("/:id",    authMiddleware, categoryController.updateCategory);
router.delete("/:id", authMiddleware, categoryController.deleteCategory);

export default router;
