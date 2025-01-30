// import recipeModel from "../models/recipe_model";
// import { Request, Response } from "express";
// import BaseController from "./base_controller";

// const recipeController = new BaseController(recipeModel);//לא בטוח

// //get by title??


// export default recipeController;


import recipeModel from "../models/recipe_model";
import { IRecipe } from "../models/recipe_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";
import { Model } from "mongoose";


class RecipeController extends BaseController<IRecipe> {
    constructor(model: Model<IRecipe>) {
        super(model);
    }

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