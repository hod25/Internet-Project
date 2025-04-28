import express from "express";
const router = express.Router();
import recipeController from "../controllers/recipe_controller";
import { authMiddleware } from "../controllers/auth_controller";
import multer from 'multer';
import path from 'path';

/**
 * @swagger
 * tags:
 *   name: Recipe
 *   description: The Recipe API
 */

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Create a new recipe
 *     description: This endpoint allows the user to create a new recipe.
 *     tags:
 *       - Recipe
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Recipe object to create a new recipe
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - ingredients
 *               - owner
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               owner:
 *                 type: string
 *               likes:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /recipes/random:
 *   post:
 *     summary: Get a random recipe from MealDB
 *     description: This endpoint fetches a random recipe from the MealDB API and creates it in the system.
 *     tags:
 *       - Recipe
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Random recipe fetched and created successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /recipes/search:
 *   get:
 *     summary: Search recipes by tag and title
 *     description: This endpoint allows the user to search recipes by tags and title.
 *     tags:
 *       - Recipe
 *     parameters:
 *       - name: title
 *         in: query
 *         description: Title of the recipe to search for
 *         required: false
 *         schema:
 *           type: string
 *       - name: tags
 *         in: query
 *         description: Tags to filter recipes by
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: List of recipes matching the search criteria
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /recipes/{_id}:
 *   put:
 *     summary: Update a recipe by ID
 *     description: This endpoint allows the user to update a specific recipe by its ID.
 *     tags:
 *       - Recipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: _id
 *         in: path
 *         description: ID of the recipe to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated recipe data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *               likes:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Recipe not found
 */

/**
 * @swagger
 * /recipes/like/{_id}:
 *   put:
 *     summary: Add a like to a recipe
 *     description: This endpoint allows the user to add a like to a specific recipe by ID.
 *     tags:
 *       - Recipe
 *     parameters:
 *       - name: _id
 *         in: path
 *         description: ID of the recipe to like
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like added successfully
 *       404:
 *         description: Recipe not found
 */

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Get all recipes
 *     description: This endpoint returns a list of all recipes.
 *     tags:
 *       - Recipe
 *     responses:
 *       200:
 *         description: List of all recipes
 */

/**
 * @swagger
 * /recipes/{_id}:
 *   get:
 *     summary: Get a recipe by ID
 *     description: This endpoint returns a recipe by its ID.
 *     tags:
 *       - Recipe
 *     parameters:
 *       - name: _id
 *         in: path
 *         description: ID of the recipe to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe retrieved successfully
 *       404:
 *         description: Recipe not found
 */

/**
 * @swagger
 * /recipes/user/{_id}:
 *   get:
 *     summary: Get recipes by user ID
 *     description: This endpoint returns a list of recipes created by a specific user.
 *     tags:
 *       - Recipe
 *     parameters:
 *       - name: _id
 *         in: path
 *         description: ID of the user whose recipes to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of recipes created by the user
 */

/**
 * @swagger
 * /recipes/{_id}:
 *   delete:
 *     summary: Delete a recipe by ID
 *     description: This endpoint deletes a recipe by its ID.
 *     tags:
 *       - Recipe
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: _id
 *         in: path
 *         description: ID of the recipe to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *       404:
 *         description: Recipe not found
 */

/**
 * @swagger
 * /recipes/upload:
 *   post:
 *     summary: Upload an image
 *     description: This endpoint allows users to upload an image.
 *     tags:
 *       - Recipe
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL of the uploaded image
 *       400:
 *         description: Invalid file
 */


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
        console.log("storage: " + file.originalname);
        
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ storage: storage });
/**
* @swagger
* tags:
*   name: Recipe
*   description: The Recipe API
*/

// Define the endpoint for fetching recipes
//router.get("/recipes", recipeController.getRecipes);

// Post request to create a new recipe
router.post("/",authMiddleware, recipeController.create.bind(recipeController));

//Get random recipe from mealdb
router.post("/random", authMiddleware, recipeController.createFromMealDB.bind(recipeController))

// Get request to search by tag and title
router.get("/search", recipeController.getRecipeByTagsAndTitle.bind(recipeController));

// Update request to update a recipe by id
router.put("/:_id", authMiddleware, recipeController.update.bind(recipeController));

router.put("/like/:_id",recipeController.addLike.bind(recipeController))

// Get request to get all recipes
router.get("/", recipeController.get.bind(recipeController));

// Get request to get recipe by id
router.get("/:_id", recipeController.getById.bind(recipeController));

// Get request to get by user id
router.get("/user/:_id", recipeController.getRecipeByUser.bind(recipeController));

// Delete request to delete a recipe by id
router.delete("/:_id", authMiddleware, recipeController.delete.bind(recipeController));

router.post('/upload', upload.single("image"), function (req, res) {
    if (req.file)
        res.status(200).send({ url: req.file.path })
    else
        res.status(400).send("Not a valid file")
 });    
 

export default router;