import recipeModel from "../models/recipe_model";
import { IRecipe } from "../models/recipe_model";
import ingredientModel from "../models/ingredient_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";
import { Model } from "mongoose";


class RecipeController extends BaseController<IRecipe> {

    constructor(model: Model<IRecipe>) {
        super(model);
    }

    override async get(req: Request, res: Response) {
        const filter = req.params._id;
        try {
            let recipes;
            if (filter) {
                recipes = await this.model.find({ _id: filter });
            } else {
                recipes = await this.model.find();
            }
            console.log(recipes);
            
            if (recipes.length==0){
                res.status(404).send({ message: "No recipes found" });
            }
            else {    
                // שליפת הרכיבים לכל מתכון והמרת האובייקטים לשמות בלבד
                const recipesWithIngredients = await Promise.all(
                    recipes.map(async (recipe) => {
                        const ingredients = await ingredientModel.find({ recipe: recipe._id });
                        const ingredientNames = ingredients.map((ing) => ing.name); // מחזיר רק שמות
                        return { ...recipe.toObject(), ingredients: ingredientNames };
                    })
                );

                res.send(recipesWithIngredients);
            }
        } catch (error) {
            res.status(400).json({ message: "Error retrieving recipes", error: (error as Error).message });
        }
    };

    override async create(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body;
            const createdRecipe = await this.model.create(body);
            const { ingredients } = req.body;
            const recipeId = createdRecipe._id;
    
            // בדיקה שהנתונים תקינים
            if (!Array.isArray(ingredients) || ingredients.length === 0) {
                res.status(400).json({ message: "Invalid ingredients array" });
                return;
            }
            if (!recipeId) {
                res.status(400).json({ message: "Missing recipeId" });
                return;
            }
    
            // יצירת מערך של אובייקטים להוספה
            const ingredientDocs = ingredients.map((name: string) => ({
                recipe: recipeId,
                name
            }));
    
            // הוספת הנתונים ל-DB
            const savedIngredients = await ingredientModel.insertMany(ingredientDocs);
    
            // הוספת המרכיבים למתכון שנשמר
            const fullRecipe = {
                ...createdRecipe.toObject(),
                ingredients: savedIngredients.map((ing) => ing.name)
            };
    
            res.status(201).json(fullRecipe);
            return;
        } catch (error) {
            console.error("Error adding recipe:", error);
            res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
            return;
        }
    };
    

    async getRecipeByUser(req: Request, res: Response) {
        const userId = req.body._id;
        try {
            const recipes = await this.model.find({ owner: userId });
            res.status(200).send(recipes);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getRecipeByTagTitle(req: Request, res: Response) {
        const { tag, title } = req.params;
        try {
            const recipes = await this.model.find({
                "tags.name": tag,
                title: title
            });
            res.status(200).send(recipes);
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

const recipeController = new RecipeController(recipeModel);
export default recipeController;