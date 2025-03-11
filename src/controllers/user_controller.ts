import { Request, Response } from "express";
import BaseController from "./base_controller";
import userModel from "../models/users_model";
import bcrypt from "bcryptjs";
import userTagModel from "../models/userTag_model";
import tagModel from "../models/tag_model";
import mongoose from "mongoose";
import multer from "multer";

// הגדרת ה-storage של multer (לשמור את הקבצים בספריית uploads)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // אחסון הקובץ בספריית uploads
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname); // שם ייחודי לכל קובץ
    }
  });
  
  // הגדרת המידלוויר של multer
  const upload = multer({ storage: storage }).single('img'); // 'img' הוא שם השדה שלך (הכפתור ב-FormData)
  

interface AuthenticatedRequest extends Request {
    userId?: string;
}

interface IUserTag extends mongoose.Document {
    user: mongoose.Schema.Types.ObjectId;
    tag: mongoose.Schema.Types.ObjectId;
  }

class UserController extends BaseController<typeof userModel> {
    constructor() {
        super(userModel);
    }

    async getByEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.params;            
            const items = await this.model.find({ email: email });
            res.send(items);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            console.log("Incoming request data:", req.body); // Log incoming request data
            const { email, password, name, last_name } = req.body;

            // Check if the user already exists
            const existingUser = await this.model.findOne({ email });
            if (existingUser) {
                res.status(400).send({ message: "User already exists" });
                return;
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const newUser = new this.model({
                email,
                password: hashedPassword,
                name,
                last_name
            });

            await newUser.save();
            res.status(201).send(newUser);
        } catch (error) {
            console.error("Error registering user:", error); // Log error
            res.status(400).send(error);
        }
    }

    async get(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            if (userId) {
                const user = await this.model.findById(userId);
                if (!user) {
                    res.status(404).send({ message: "User not found" });
                    return;
                }
                res.send(user);
            } else {
                const users = await this.model.find();
                res.send(users);
            }
        } catch (error) {
            console.error("Error retrieving users:", error); // Log error
            res.status(400).send(error);
        }
    }

    /*async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId; // Assuming userId is set in authMiddleware
            if (!userId) {
                res.status(401).send({ message: "Unauthorized" });
                return;
            }
            const user = await this.model.findById(userId);
            if (user) {
                res.send(user);
            } else {
                res.status(404).send({ message: "User not found" });
            }
        } catch (error) {
            res.status(400).send({ message: "Error fetching user data", error });
        }
    }*/
    
    async updateUser(req: Request, res: Response): Promise<void> {
      const { email, img, name, background, tags } = req.body;
      console.log(req.body);
    
      if (!email) {
        res.status(400).json({ message: "User email is required" });
        return;
      }
    
      const user = await userModel.findOne({ email:email });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
    
      // עדכון שם ורקע
      user.name = name || user.name;
      user.background = background || user.background;
      
      // עדכון תגיות
      if (tags) {
        // מחיקה של התגיות הקודמות
        await userTagModel.deleteMany({ user: user._id });
    
        // כאן נמצא ה-logic שמחפש את ה-ID של התגיות מתוך טבלת tags
        const tagIds = await Promise.all(
          JSON.parse(tags).map(async (tag: string) => {
            const tagDoc = await tagModel.findOne({ name: tag });
            return tagDoc ? { user: user._id, tag: tagDoc._id } : null;
          })
        );
    
        // מסנן את הערכים null אם יש כאלה
        const validTagIds = tagIds.filter((tag) => tag !== null);
    
        // הוספה של התגיות החדשות
        await userTagModel.insertMany(validTagIds);
      }
      
      await user.save();
      res.send(user);
    };
          

    async getTagsForUser (req: Request, res: Response) :Promise<void> {
        try {
          const userId = req.params._id; // מקבלים את ה-ID של המשתמש מהפרמטר ב-URL
          console.log(userId);
          
          // בודקים אם יש ID
          if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
          }
          
          // מחפשים את כל ה-UserTags עם ה-userId
          const userTags = await userTagModel.find({ user: userId }).populate('tag', 'name');
      
          // אם לא מצאנו משתמש עם התגיות
          if (userTags.length === 0) {
            res.status(404).json({ message: 'No tags found for this user' });
            return;
          }
      
          // שולפים את כל התגיות מתוך ה-populated tags
          const tags = userTags.map(userTag => userTag.tag as unknown as ({ name: string }));
      
          res.json({ tags });
          return;
        } catch (error) {
          console.error('Error fetching tags for user:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      };
}

const usersController = new UserController();

export default usersController;