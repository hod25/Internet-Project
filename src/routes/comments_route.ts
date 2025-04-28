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

/**
 * @swagger
 * /comments/{_id}:
 *   get:
 *     summary: Get a comment by ID or all comments if no ID is provided
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: false
 *         schema:
 *           type: string
 *         description: The comment ID (optional)
 *     responses:
 *       200:
 *         description: The requested comment(s)
 *       404:
 *         description: Comment not found
 */
router.get("/:_id?", commentsController.get.bind(commentsController));

/**
 * @swagger
 * /comments/recipe/{_id}:
 *   get:
 *     summary: Get comments by recipe ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: A list of comments for the recipe
 */
router.get("/recipe/:_id", commentsController.getCommentsByRecipeId.bind(commentsController));

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: The comment text
 *               owner:
 *                 type: string
 *                 description: The ID of the user creating the comment
 *               recipeId:
 *                 type: string
 *                 description: The recipe ID the comment belongs to
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, commentsController.create.bind(commentsController));

/**
 * @swagger
 * /comments:
 *   put:
 *     summary: Update an existing comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: The comment ID
 *               comment:
 *                 type: string
 *                 description: The updated comment text
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.put("/", authMiddleware, commentsController.update.bind(commentsController));

/**
 * @swagger
 * /comments/{_id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.delete("/:_id", authMiddleware, commentsController.delete.bind(commentsController));

export default router;
