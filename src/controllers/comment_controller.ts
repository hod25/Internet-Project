// comments_controller.ts
import commentsModel from "../models/comment_model";
import { IComments } from "../models/comment_model";
import { Request, Response } from "express";
import BaseController from "./base_controller";
import { Model } from "mongoose";

class CommentsController extends BaseController<IComments> {
    constructor(model: Model<IComments>) {
        super(model);
    }

    async getCommentsByRecipeId(req: Request, res: Response): Promise<void> {
        const recipeId = req.params._id;        
        try {
            const comments = await this.model.find({ recipeId: recipeId }).lean();
            if (comments.length === 0) {
                res.status(404).json({ message: "No comments found for this recipe" });
                return;
            }

            res.status(200).json(comments);
        } catch (error) {
            res.status(500).json({ message: "Error fetching comments", error: (error as Error).message });
        }
    }

}

const commentsController = new CommentsController(commentsModel);

export default commentsController;

