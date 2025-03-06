import recipeModel from "../models/recipe_model";
import { IRecipe } from "../models/recipe_model";
import ingredientModel from "../models/ingredient_model";
import tagModel from "../models/tag_model";
import recipeTagModel from "../models/recipeTag_model";
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
            
            if (recipes.length==0){
                res.status(404).send({ message: "No recipes found" });
            }
            else {    
                const recipesWithDetails = await Promise.all(
                    recipes.map(async (recipe) => {
                        // שליפת מרכיבים ויצירת מערך של שמות המרכיבים
                        const ingredients = await ingredientModel.find({ recipe: recipe._id });
                        const ingredientNames = ingredients.map((ing) => ing.name);
                
                        // שליפת תגיות מתוך טבלת recipeTag
                        const recipeTags = await recipeTagModel.find({ recipe: recipe._id }).select('tag'); // רק ObjectId של התגית
                        const tagIds = recipeTags.map(rt => rt.tag); // שליפת כל ה-ObjectId של התגיות
                
                        // שליפת שמות התגיות לפי ה-ObjectIds
                        const tags = await tagModel.find({ _id: { $in: tagIds } }).select('name'); // שליפת שמות התגיות
                        const tagNames = tags.map(tag => tag.name);  // שליפת שמות התגיות מתוך התוצאה
                
                        // החזרת המתכון עם שמות המרכיבים ושמות התגיות
                        return { ...recipe.toObject(), ingredients: ingredientNames, tags: tagNames };
                    })
                );

                res.send(recipesWithDetails);
            }
        } catch (error) {
            res.status(400).json({ message: "Error retrieving recipes", error: (error as Error).message });
        }
    }

    override async create(req: Request, res: Response): Promise<void> {
        try {

            let ingredients = req.body.ingredients;

            // המרה ל-JSON בכל מקרה, אבל אם זה לא מחרוזת, נמיר אותו קודם למחרוזת
            try {
                ingredients = JSON.parse(typeof ingredients === "string" ? ingredients : JSON.stringify(ingredients));
            } catch (error) {
                console.error("❌ Invalid JSON format:", ingredients);
                ingredients = []; // ברירת מחדל במקרה של שגיאה
            }
            
            let tags = req.body.tags;

            // המרה ל-JSON בכל מקרה, עם בדיקה שהנתון מוכן לפענוח
            try {
                tags = JSON.parse(typeof tags === "string" ? tags : JSON.stringify(tags));
            } catch (error) {
                console.error("❌ Invalid JSON format for tags:", tags);
                tags = []; // ברירת מחדל במקרה של שגיאה
            }

    
            // בדיקות תקינות
            if (!Array.isArray(ingredients) || ingredients.length === 0) {
                res.status(400).json({ message: "Invalid or missing ingredients array" });
                return;
            }
            if (!Array.isArray(tags) || tags.length === 0) {
                res.status(400).json({ message: "Invalid or missing tags array" });
                return;
            }
    
            // קבלת המשתמש המחובר (במקום לשלוח owner מהפרונט)
            //const owner =  "guest";  // 👈 צריך authMiddleware        //req.user?.id ||
    
            // יצירת המתכון
            const createdRecipe = await this.model.create({
                image: req.body.image,
                title: req.body.title,
                likes: Number(req.body.likes) || 0, // המרה למספר
                owner: req.body.owner,
            });
            const recipeId = createdRecipe._id;
    
            // שמירת מרכיבים
            const ingredientDocs = ingredients.map((name: string) => ({
                recipe: recipeId,
                name
            }));
            const savedIngredients = await ingredientModel.insertMany(ingredientDocs);
    
            // שמירת תגיות
            const tagDocs = await Promise.all(tags.map(async (tagName: string) => {
                let tag = await tagModel.findOne({ name: tagName });
                if (!tag) {
                    tag = await tagModel.create({ name: tagName });
                }
                return { recipe: recipeId, tag: tag._id };
            }));
            await recipeTagModel.insertMany(tagDocs);
    
            // החזרת המתכון ללקוח
            const fullRecipe = {
                ...createdRecipe.toObject(),
                ingredients: savedIngredients.map((ing) => ing.name),
                tags
            };
            res.status(201).json(fullRecipe);
        } catch (error) {
            console.error("Error adding recipe:", error);
            res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
        }
    }
    

    async getRecipeByUser(req: Request, res: Response) {
        const userId = req.params._id;
        try {
            const recipes = await this.model.find({ owner: userId });
            res.status(200).send(recipes);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getRecipeByTagsAndTitle(req: Request, res: Response) {
        const { tags, title } = req.query;
        try {
            const tagNames = tags ? (tags as string).split(',').filter(Boolean) : [];
            let tagIds: string[] = [];
    
            if (tagNames.length > 0) {
                const tagDocs = await tagModel.find({ name: { $in: tagNames } });
                if (tagDocs.length === 0) {
                    res.status(404).send({ message: "No tags found" });
                    return;
                }
                tagIds = tagDocs.map(tag => tag._id.toString());
            }
    
            let recipeIds: string[] = [];
            if (tagIds.length > 0) {
                const recipeTagDocs = await recipeTagModel.find({ tag: { $in: tagIds } });
                recipeIds = recipeTagDocs.map(rt => rt.recipe.toString());
            }
    
            const query: any = {};
            if (title) {
                query.title = title;
            }
            if (recipeIds.length > 0) {
                query._id = { $in: recipeIds };
            }
    
            if (!title && tagIds.length === 0) {
                const recipes = await recipeModel.find();
                res.status(200).send(recipes);
            }
    
            const recipes = await recipeModel.find(query);
            if (recipes.length === 0) {
                res.status(404).send({ message: "No recipes found" });
                return;
            }
    
            res.status(200).send(recipes);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    override async delete(req: Request, res: Response) {
        const id = req.params._id;
        try {
            const recipe = await this.model.findByIdAndDelete(id);
            if (!recipe) {
                res.status(404).json({ message: "Recipe not found" });
                return;
            }
            await ingredientModel.deleteMany({ recipe: id });
            await recipeTagModel.deleteMany({ recipe: id });
            res.status(200).json({ message: "Recipe deleted successfully" });
        } catch (error) {
            res.status(400).json({ message: "Error deleting recipe", error: (error as Error).message });
        }
    }
    
    override async update(req: Request, res: Response) {
        try {
            const { _id, ingredients, tags } = req.body;
            const body = req.body;
            const item = await this.model.findByIdAndUpdate(_id, body, { new: true });
            
            await ingredientModel.deleteMany({ recipe: _id });
            const ingredientDocs = ingredients.map((name: string) => ({ recipe: _id, name }));
            await ingredientModel.insertMany(ingredientDocs);
            
            await recipeTagModel.deleteMany({ recipe: _id });
            const tagDocs = await Promise.all(tags.map(async (tagName: string) => {
                let tag = await tagModel.findOne({ name: tagName });
                if (!tag) {
                    tag = await tagModel.create({ name: tagName });
                }
                return { recipe: _id, tag: tag._id };
            }));
            
            await recipeTagModel.insertMany(tagDocs);
            res.status(200).json({ message: "Recipe updated successfully",...item?.toObject(), ingredients,tags});
        } catch (error) {
            res.status(400).json({ message: "Error updating recipe", error: (error as Error).message });
        }
    }

    async getRecipes(req: Request, res: Response) {
        try {
            const recipes = await this.model.find();
            res.status(200).json(recipes);
        } catch (error) {
            res.status(400).json({ message: "Error retrieving recipes", error: (error as Error).message });
        }
    }
}

const recipeController = new RecipeController(recipeModel);

export default recipeController;