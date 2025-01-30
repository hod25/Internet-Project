import express from "express";
const router = express.Router();
import { RecipeController } from "../controllers/recipe_controller";


/**
* @swagger
* tags:
*   name: Recipe
*   description: The Recipe API
*/


//post request to create a new recipe
router.post("/", RecipeController.createRecipe);

//update request to update a recipe by id
router.put("/:id", RecipeController.updateRecipe);

//get request to get recipe by id
router.get("/:id", RecipeController.getRecipe);

//get request to get by user id
router.get("/:user", RecipeController.getRecipeByUser);

//get request to by tag and title
router.get("/:tag/:title", RecipeController.getRecipeByTagTitle);

// delete request to delete a recipe by id
router.delete("/:id", RecipeController.deleteRecipe);
