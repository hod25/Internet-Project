import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller";

/**
* @swagger
* tags:
*   name: Comments
*   description: The Comments API
*/

router.get("/", commentsController.getAll.bind(commentsController));

router.get("/:id", commentsController.getById.bind(commentsController));

router.post("/", commentsController.create.bind(commentsController));

router.delete("/:id", commentsController.deleteItem.bind(commentsController));

export default router;