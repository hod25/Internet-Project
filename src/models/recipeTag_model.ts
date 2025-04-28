import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     RecipeTag:
 *       type: object
 *       required:
 *         - recipe
 *         - tag
 *       properties:
 *         recipe:
 *           type: string
 *           description: The ID of the recipe associated with this tag
 *         tag:
 *           type: string
 *           description: The ID of the tag associated with this recipe
 *       example:
 *         recipe: "60b8d295f1d2c70015f8aabc"
 *         tag: "60b8d295f1d2c70015f8aadf"
 */


/**
 * Interface representing a RecipeTag document in MongoDB.
 * This interface associates a recipe with a tag.
 * @interface
 * @extends {mongoose.Document}
 */
interface IRecipeTag extends mongoose.Document {
  /**
   * The recipe associated with this tag.
   * @type {mongoose.Schema.Types.ObjectId}
   * @required
   */
  recipe: mongoose.Schema.Types.ObjectId;

  /**
   * The tag associated with this recipe.
   * @type {mongoose.Schema.Types.ObjectId}
   * @required
   */
  tag: mongoose.Schema.Types.ObjectId;
}

/**
 * Schema for the RecipeTag model.
 * This schema defines the relationship between recipes and tags in MongoDB.
 * @type {mongoose.Schema}
 */
const recipeTagSchema = new mongoose.Schema<IRecipeTag>({
  /**
   * The recipe associated with this tag.
   * This field references the Recipe model.
   * @type {mongoose.Schema.Types.ObjectId}
   * @required
   */
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },

  /**
   * The tag associated with this recipe.
   * This field references the Tag model.
   * @type {mongoose.Schema.Types.ObjectId}
   * @required
   */
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true,
  },
});

/**
 * The RecipeTag model based on the recipeTagSchema.
 * This model represents the relationship between a recipe and its tags.
 * @type {mongoose.Model<IRecipeTag>}
 */
const recipeTagModel = mongoose.model<IRecipeTag>("RecipeTag", recipeTagSchema);

export default recipeTagModel;
