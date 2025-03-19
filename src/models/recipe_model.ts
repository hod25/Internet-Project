import mongoose from "mongoose";

export interface IRecipe {
  title: string;
  image?: string;
  ingredients: string[]; // לוודא שזה Array
  tags?: string[];
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
    required: false,
  },
  ingredients: {
    type: [String], // שינוי לסוג נכון
    required: false,
  },
  tags: {
    type: [String], // שינוי לסוג נכון
    required: false,
    default: [], // הוספת ערך ברירת מחדל כדי למנוע שגיאה
  },
  owner: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
    default: 0, // למנוע בעיות אם לא נשלח ערך
  },
});

const recipeModel = mongoose.model<IRecipe>("Recipe", recipeSchema);

export default recipeModel;
