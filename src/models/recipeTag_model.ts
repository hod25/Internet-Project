import express from 'express';
import mongoose from "mongoose";
import recipeModel from './recipe_model';
import tagModel from './tag_model';

interface IRecipeTag extends mongoose.Document {
    recipe: mongoose.Schema.Types.ObjectId;
    tag: mongoose.Schema.Types.ObjectId;
}
const recipeTagSchema = new mongoose.Schema<IRecipeTag>({
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true,
    },
    tag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: true,
    },

});
  
const recipeTagModel = mongoose.model<IRecipeTag>("RecipeTag", recipeTagSchema);
  
export default recipeTagModel;