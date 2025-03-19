import recipeModel from "../models/recipe_model";
import { IRecipe } from "../models/recipe_model";
import ingredientModel from "../models/ingredient_model";
import tagModel from "../models/tag_model";
import recipeTagModel from "../models/recipeTag_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";
import { Model } from "mongoose";
import { ITag } from "../models/tag_model"
import * as https from 'https'
import path from 'path';
import fs from 'fs';



class RecipeController extends BaseController<IRecipe> {
    constructor(model: Model<IRecipe>) {
        super(model);
    };

    async createFromMealDB(req: Request, res: Response): Promise<void> {
        try {
            // קבלת מתכון רנדומלי מ-MealDB
            const mealData = await this.getRandomRecipe();

            if (!mealData) {
                res.status(500).json({ message: "Failed to fetch recipe from MealDB" });
                return;
            }

            // המרה לפורמט שהפונקציה `create` דורשת
            const formattedRequest: Partial<Request> = {
                body: {
                    title: mealData.strMeal,
                    image: mealData.strMealThumb,
                    owner: req.body.owner || "guest", // ברירת מחדל לבעלים
                    likes: 0,
                    ingredients: this.extractIngredients(mealData), // הפקת רשימת מרכיבים
                    tags: this.extractTags(mealData) // הפקת רשימת תגיות
                }
            };

            // קריאה לפונקציה `create` עם הבקשה החדשה
            await this.create(formattedRequest as Request, res);
        } catch (error) {
            console.error("Error creating recipe from MealDB:", error);
            res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
        }
    };

    // פונקציה שמביאה מתכון רנדומלי מ-MealDB
    private async getRandomRecipe(): Promise<any> {
        return new Promise((resolve, reject) => {
            https.get('https://www.themealdb.com/api/json/v1/1/random.php', (apiRes) => {
                let data = '';

                apiRes.on('data', (chunk) => {
                    data += chunk.toString();
                });

                apiRes.on('end', () => {
                    try {
                        const parsedData = JSON.parse(data);
                        resolve(parsedData.meals ? parsedData.meals[0] : null);
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    };

    // פונקציה לשליפת רשימת מרכיבים מהמתכון שהתקבל
    private extractIngredients(mealData: any): string[] {
        const ingredients: string[] = [];
        for (let i = 1; i <= 20; i++) { // עד 20 מרכיבים פוטנציאליים
            const ingredient = mealData[`strIngredient${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(ingredient.trim());
            }
        }
        return ingredients;
    }

    // פונקציה לשליפת תגיות מהמתכון שהתקבל
    private extractTags(mealData: any): string[] {
        return mealData.strTags ? mealData.strTags.split(',').map((tag: string) => tag.trim()) : [];
    };



    override async get(req: Request, res: Response): Promise<void> {
        try {
            let page = parseInt(req.query.page as string) || 1;
            let limit = parseInt(req.query.limit as string) || 10;
    
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
    
            const skip = (page - 1) * limit;
    
            // קבלת מספר המתכונים הכולל
            const totalRecipes = await this.model.countDocuments();
            const totalPages = Math.ceil(totalRecipes / limit);
    
            // שליפת המתכונים
            const recipes = await this.model.find()
                .populate("owner", "name")
                .skip(skip)
                .limit(limit)
                .lean(); 
            
            if (!recipes.length) {
                res.status(404).json({ message: "No recipes found", totalPages });
                return;
            }
    
            // המרת ObjectId למחרוזת
            const recipeIds = recipes.map(recipe => recipe._id.toString());
    
            // שליפת המרכיבים
            const ingredients = await ingredientModel.find({ recipe: { $in: recipeIds } }).lean();
            const groupedIngredients: Record<string, string[]> = {};
            ingredients.forEach(ing => {
                const recipeId = ing.recipe.toString();
                if (!groupedIngredients[recipeId]) groupedIngredients[recipeId] = [];
                groupedIngredients[recipeId].push(ing.name.toString());
            });
    
            // שליפת תגיות
            const recipeTags = await recipeTagModel
                .find({ recipe: { $in: recipeIds } })
                .populate<{ tag: ITag }>("tag")
                .lean();
            
            //console.log(recipeTags);

            const groupedTags: Record<string, string[]> = {};
                recipeTags.forEach(tag => {
                    const recipeId = tag.recipe.toString();
                    if (!groupedTags[recipeId]) 
                        groupedTags[recipeId] = [];
                    if (tag.tag && tag.tag.name) {
                        groupedTags[recipeId].push(tag.tag.name.toString());
                    }
                });

            // הוספת המרכיבים והתגיות לכל מתכון
            const enrichedRecipes = recipes.map(recipe => ({
                ...recipe,
                ingredients: groupedIngredients[recipe._id.toString()] || [],
                tags: groupedTags[recipe._id.toString()] || []
            }));
    
            res.json({ recipes: enrichedRecipes, totalPages });
        } catch (error) {
            console.error("❌ Error retrieving recipes:", error);
            res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
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

    async deleteImage(imagePath: string) {
        const filePath = path.join(__dirname, 'public', imagePath); // בנה את הנתיב המלא לקובץ
      
        // אם הקובץ קיים, נמחק אותו
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting image:', err);
          } else {
            console.log('Image deleted successfully');
          }
        });
    };

    override async delete(req: Request, res: Response) : Promise<void> {
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
            const { _id, ingredients, tags} = req.body;
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

    async addLike(req: Request, res: Response) : Promise<void> {
        try {
            const _id = req.params._id;
            const item = await recipeModel.findById({ _id: _id });
            if (!item) {
                res.status(404).json({ error: "Recipe not found" });
                return; 
            }

            item.likes+=1;
            await item.save(); // שמירה במסד הנתונים

            res.json({ message: "Like added", likes: item.likes }); // מחזיר מספר לייקים עדכני
        } catch (error) {
            res.status(400).json({ message: "Error adding like", error: (error as Error).message });
        }
    }
}

const recipeController = new RecipeController(recipeModel);

export default recipeController;