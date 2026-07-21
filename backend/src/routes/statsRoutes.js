import { Router } from "express";
import { getOverviewStats } from "../controllers/statsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/overview", verifyToken, getOverviewStats);

export default router;
