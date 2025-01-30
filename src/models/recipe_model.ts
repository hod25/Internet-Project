import mongoose from "mongoose";

export interface IRecipe {
  title: string;
  image: string;
  ingredients: { name: string }[] ;
  tags: { name: string }[];
  owner: string;
  likes: number;
}

const recipeSchema = new mongoose.Schema<IRecipe>({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required:  false,
  },
  // ingredients: {
  //   type: String,
  //   required: true,
  // },
  // tags: {
  //   type: String,
  //   required: true,
  // },
  owner: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },
});

const recipeModel = mongoose.model<IRecipe>("Recipe", recipeSchema);

export default recipeModel;