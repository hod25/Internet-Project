import express from "express";
const router = express.Router();
import commentsController from "../controllers/comment_controller";

/**
* @swagger
* tags:
*   name: Comments
*   description: The Comments API
*/

router.get("/", commentsController.get.bind(commentsController));

router.get("/:id", commentsController.get.bind(commentsController));

router.post("/", commentsController.create.bind(commentsController));

router.delete("/:id", commentsController.deleteItem.bind(commentsController));

export default router;