import express from "express";
const router = express.Router();
import recipeController from "../controllers/recipe_controller";

/**
* @swagger
* tags:
*   name: Recipe
*   description: The Recipe API
*/


//post request to create a new recipe    ><
router.post("/", recipeController .create.bind(recipeController ));

//update request to update a recipe by id 
router.put("/:id", recipeController .update.bind(recipeController ));

//get request to getAll recipes ><
router.get("/", recipeController .get.bind(recipeController ));

//get request to get recipe by id ><
router.get("/:id", recipeController .get.bind(recipeController ));

//get request to get by user id ><
router.get("/user/:id", recipeController .getRecipeByUser.bind(recipeController ));

//get request to by tag and title ><
router.get("/:tag/:title", recipeController .getRecipeByTagTitle.bind(recipeController ));

// delete request to delete a recipe by id ><
router.delete("/:id", recipeController .delete.bind(recipeController ));

export default router;