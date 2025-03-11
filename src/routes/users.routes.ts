import express from "express";
const router = express.Router();
import usersController from "../controllers/user_controller";
import { authMiddleware } from "../controllers/auth_controller";

/**
* @swagger
* tags:
*   name: User
*   description: The User API
*/

router.post("/register" , usersController.register.bind(usersController));

router.get("/:email", usersController.getByEmail.bind(usersController));

router.get("/tags/:_id", usersController.getTagsForUser.bind(usersController))

router.get("/:id", usersController.get.bind(usersController));

router.get("/", usersController.get.bind(usersController));

router.put("/", authMiddleware ,usersController.updateUser.bind(usersController))

router.delete("/:id", usersController.delete.bind(usersController));

export default router;