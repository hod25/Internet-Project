import express from "express";
const router = express.Router();
import usersController from "../controllers/user_controller";
// import { authMiddleware } from "../controllers/auth_controller";

/**
* @swagger
* tags:
*   name: User
*   description: The User API
*/

router.get("/", usersController.get.bind(usersController));

router.get("/:id", usersController.get.bind(usersController));
router.get("/:email", usersController.getByEmail.bind(usersController));

router.delete("/:id", usersController.deleteItem.bind(usersController));

export default router;