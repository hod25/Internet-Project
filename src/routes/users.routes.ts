import express from "express";
const router = express.Router();
import usersController from "../controllers/users_controller";
import { authMiddleware } from "../controllers/auth_controller";

router.get("/", usersController.getAll.bind(usersController));

router.get("/:id", usersController.getById.bind(usersController));
router.get("/:email", usersController.getByEmail.bind(usersController));

router.delete("/:id", usersController.deleteItem.bind(usersController));

export default router;