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
    /*
    // יצירת תגובה חדשה
    async createComment(req: Request, res: Response): Promise<void> {
        try {
            const { comment, owner, recipeId } = req.body;

            // בדיקת תקינות
            if (!comment || !owner || !recipeId) {
                res.status(400).json({ message: "Missing required fields" });
                return;
            }

            // יצירת התגובה
            const newComment = new this.model({ comment, owner, recipeId });
            const savedComment = await newComment.save();

            res.status(201).json(savedComment);
        } catch (error) {
            console.error("Error creating comment:", error);
            res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
        }
    }

    // אפשר להוסיף פונקציות נוספות לפי הצורך, למשל:
    // קבלת תגובות לפי מזהה מתכון
    async getCommentsByRecipeId(req: Request, res: Response): Promise<void> {
        const { recipeId } = req.params;
        try {
            const comments = await this.model.find({ recipeId }).lean();
            if (comments.length === 0) {
                res.status(404).json({ message: "No comments found for this recipe" });
                return;
            }

            res.status(200).json(comments);
        } catch (error) {
            res.status(500).json({ message: "Error fetching comments", error: (error as Error).message });
        }
    }

    // אפשר גם לעדכן או למחוק תגובות
    // דוגמה לפונקציה שמעדכנת תגובה
    async updateComment(req: Request, res: Response): Promise<void> {
        const { _id, comment } = req.body;
        try {
            const updatedComment = await this.model.findByIdAndUpdate(_id, { comment }, { new: true });
            if (!updatedComment) {
                res.status(404).json({ message: "Comment not found" });
                return;
            }

            res.status(200).json(updatedComment);
        } catch (error) {
            res.status(500).json({ message: "Error updating comment", error: (error as Error).message });
        }
    }

    // דוגמה לפונקציה שמוחקת תגובה
    async deleteComment(req: Request, res: Response): Promise<void> {
        const { _id } = req.params;
        try {
            const deletedComment = await this.model.findByIdAndDelete(_id);
            if (!deletedComment) {
                res.status(404).json({ message: "Comment not found" });
                return;
            }

            res.status(200).json({ message: "Comment deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting comment", error: (error as Error).message });
        }
    }*/
}

const commentsController = new CommentsController(commentsModel);

export default commentsController;

