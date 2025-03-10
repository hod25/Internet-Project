import express from "express";
const router = express.Router();
import commentsController from "../controllers/comment_controller";
import { authMiddleware } from "../controllers/auth_controller";


/**
* @swagger
* tags:
*   name: Comments
*   description: The Comments API
*/

router.get("/:_id", commentsController.get.bind(commentsController));

router.get("/", commentsController.get.bind(commentsController));

router.post("/", authMiddleware, commentsController.create.bind(commentsController));

router.delete("/:id", authMiddleware, commentsController.delete.bind(commentsController));

export default router;