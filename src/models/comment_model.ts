import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - comment
 *         - owner
 *         - recipeId
 *       properties:
 *         comment:
 *           type: string
 *           description: The comment text
 *         owner:
 *           type: string
 *           description: The ID of the user who owns the comment
 *         recipeId:
 *           type: string
 *           description: The ID of the recipe this comment belongs to
 *       example:
 *         comment: "This recipe is amazing!"
 *         owner: "60b8d295f1d2c70015f8aabc"
 *         recipeId: "60b8d295f1d2c70015f8aadf"
 */

export interface IComments {
  comment: string;
  owner: string;
  recipeId: string;
}

const commentsSchema = new mongoose.Schema<IComments>({
  comment: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  recipeId: {
    type: String,
    required: true,
  },
});

const commentsModel = mongoose.model<IComments>("Comments", commentsSchema);

export default commentsModel;
