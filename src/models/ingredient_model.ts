import express from 'express';
import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       required:
 *         - recipe
 *         - name
 *       properties:
 *         recipe:
 *           type: string
 *           description: The ID of the recipe this ingredient belongs to
 *         name:
 *           type: string
 *           description: The name of the ingredient
 *       example:
 *         recipe: "60b8d295f1d2c70015f8aabc"
 *         name: "Sugar"
 */


/**
 * Interface representing an Ingredient document in MongoDB.
 * @interface
 * @extends {mongoose.Document}
 */
interface IIngredient extends mongoose.Document {
    /**
     * The recipe associated with the ingredient.
     * @type {mongoose.Schema.Types.ObjectId}
     */
    recipe: mongoose.Schema.Types.ObjectId;

    /**
     * The name of the ingredient.
     * @type {String}
     */
    name: string;
}

/**
 * Schema for the Ingredient model.
 * Defines the structure of an Ingredient document in MongoDB.
 * @type {mongoose.Schema}
 */
const ingredientSchema = new mongoose.Schema<IIngredient>({
    /**
     * The recipe associated with this ingredient.
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
     * The name of the ingredient.
     * @type {String}
     * @required
     */
    name: {
        type: String,
        required: true,
    },
});

/**
 * The Ingredient model based on the ingredientSchema.
 * @type {mongoose.Model<IIngredient>}
 */
const ingredientModel = mongoose.model<IIngredient>("Ingredients", ingredientSchema);

export default ingredientModel;
