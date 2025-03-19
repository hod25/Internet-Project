import express from "express";
const router = express.Router();
import recipeController from "../controllers/recipe_controller";
import { authMiddleware } from "../controllers/auth_controller";
import multer from 'multer';
import path from 'path';

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

// הגדרת Multer להעלאת קבצים
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