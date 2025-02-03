import express from 'express';
import mongoose from "mongoose";

interface IIngridient extends mongoose.Document {
    recipe: mongoose.Schema.Types.ObjectId;
    name: mongoose.Schema.Types.ObjectId;
}
const ingredientSchema = new mongoose.Schema<IIngridient>({
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true,
    },
    name: {
        type: String,
        required: true
    },

});
  
const ingredientModel = mongoose.model<IIngridient>("RecipeTag", ingredientSchema);
  
export default ingredientModel;