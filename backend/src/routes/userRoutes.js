import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  toggleBlockStatus,
  updateUserRole,
} from "../controllers/userController.js";
import { authorizeRoles, verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verifyToken, authorizeRoles("ADMIN"));

router.get("/", getAllUsers);
router.put("/:id/role", updateUserRole);
router.put("/:id/block", toggleBlockStatus);
router.delete("/:id", deleteUser);

export default router;
