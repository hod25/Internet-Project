import express from "express";
const router = express.Router();
import recipeController from "../controllers/recipe_controller";

/**
* @swagger
* tags:
*   name: Recipe
*   description: The Recipe API
*/

// Define the endpoint for fetching recipes
//router.get("/recipes", recipeController.getRecipes);

// Post request to create a new recipe
router.post("/", recipeController.create.bind(recipeController));

// Get request to search by tag and title
router.get("/search", recipeController.getRecipeByTagsAndTitle.bind(recipeController));

// Update request to update a recipe by id
router.put("/:_id", recipeController.update.bind(recipeController));

// Get request to get all recipes
router.get("/", recipeController.get.bind(recipeController));

// Get request to get recipe by id
router.get("/:_id", recipeController.get.bind(recipeController));

// Get request to get by user id
router.get("/user/:_id", recipeController.getRecipeByUser.bind(recipeController));

// Delete request to delete a recipe by id
router.delete("/:_id", recipeController.delete.bind(recipeController));

export default router;