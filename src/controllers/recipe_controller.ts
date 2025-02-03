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

    override async create(req: Request, res: Response) {
        const body = req.body;
        const createdRecipe = await this.model.create(body);
        try {
            const { ingredients } = req.body;
            const recipeId = createdRecipe._id;
            console.log(req);
        
            // בדיקה שהנתונים תקינים
            if (!Array.isArray(ingredients) || ingredients.length === 0) {
                res.status(400).json({ message: "Invalid ingredients array" });
            }
            if (!recipeId) {
                res.status(400).json({ message: "Missing recipeId" });
            }
        
            // יצירת מערך של אובייקטים להוספה
            const ingredientDocs = ingredients.map((name: string) => ({
                recipe: recipeId,
                name
            }));
            
            // הוספת הנתונים ל-DB
            const savedIngredients = await ingredientModel.insertMany(ingredientDocs);
        
            res.status(201).send(savedIngredients);
        } catch (error) {
            console.error("Error adding ingredients:", error);
            res.status(500).json({ message: "Internal Server Error", error });
        }
    };

    async getRecipeByUser(req: Request, res: Response) {
        const userId = req.params.id;
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