import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       required:
 *         - title
 *         - ingredients
 *         - owner
 *         - likes
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the recipe
 *         image:
 *           type: string
 *           description: The image URL for the recipe
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of ingredients required for the recipe
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of tags associated with the recipe (e.g., vegan, gluten-free)
 *         owner:
 *           type: string
 *           description: The owner of the recipe (e.g., the user's ID who created it)
 *         likes:
 *           type: number
 *           description: The number of likes the recipe has received
 *           default: 0
 *       example:
 *         title: "Chocolate Cake"
 *         image: "https://example.com/chocolate-cake.jpg"
 *         ingredients: ["Flour", "Sugar", "Eggs", "Cocoa Powder"]
 *         tags: ["Vegan", "Gluten-Free"]
 *         owner: "60b8d295f1d2c70015f8aabc"
 *         likes: 100
 */


/**
 * Interface representing a Recipe document in MongoDB.
 * @interface
 */
export interface IRecipe {
  /**
   * The title of the recipe.
   * @type {string}
   * @required
   */
  title: string;

  /**
   * The image URL for the recipe.
   * @type {string}
   * @optional
   */
  image?: string;

  /**
   * A list of ingredients required for the recipe.
   * @type {string[]}
   * @required
   */
  ingredients: string[];

  /**
   * A list of tags associated with the recipe (e.g., vegan, gluten-free).
   * @type {string[]}
   * @optional
   */
  tags?: string[];

  /**
   * The owner of the recipe (e.g., the user's ID who created it).
   * @type {string}
   * @required
   */
  owner: string;

  /**
   * The number of likes the recipe has received.
   * @type {number}
   * @required
   * @default 0
   */
  likes: number;
}

/**
 * Schema for the Recipe model.
 * Defines the structure of a Recipe document in MongoDB.
 * @type {mongoose.Schema}
 */
const recipeSchema = new mongoose.Schema<IRecipe>({
  /**
   * The title of the recipe.
   * @type {String}
   * @required
   */
  title: {
    type: String,
    required: true,
  },

  /**
   * The image URL for the recipe.
   * @type {String}
   * @optional
   */
  image: {
    type: String,
    required: false,
  },

  /**
   * A list of ingredients required for the recipe.
   * @type {String[]}
   * @required
   */
  ingredients: {
    type: [String], // Array of strings for ingredients
    required: false,
  },

  /**
   * A list of tags associated with the recipe.
   * @type {String[]}
   * @optional
   * @default []
   */
  tags: {
    type: [String], // Array of strings for tags
    required: false,
    default: [], // Default value to avoid errors if not provided
  },

  /**
   * The owner of the recipe.
   * @type {String}
   * @required
   */
  owner: {
    type: String,
    required: true,
  },

  /**
   * The number of likes the recipe has.
   * @type {Number}
   * @required
   * @default 0
   */
  likes: {
    type: Number,
    required: true,
    default: 0, // Default value to avoid errors if not provided
  },
});

/**
 * The Recipe model based on the recipeSchema.
 * @type {mongoose.Model<IRecipe>}
 */
const recipeModel = mongoose.model<IRecipe>("Recipe", recipeSchema);

export default recipeModel;
