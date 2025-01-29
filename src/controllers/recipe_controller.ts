import recipeModel from "../models/recipe_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";

const recipeController = new BaseController(recipeModel);//לא בטוח

//get by title??


export default recipeController;