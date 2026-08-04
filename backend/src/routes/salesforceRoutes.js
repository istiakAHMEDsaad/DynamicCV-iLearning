import { Router } from "express";
import { syncProfileToSalesforce } from "../controllers/salesforceController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

router.post(
  "/sync",
  verifyToken,
  authorizeRoles("CANDIDATE"),
  syncProfileToSalesforce,
);

export default router;
