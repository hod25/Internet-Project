import { Request, Response } from "express";
import BaseController from "./base_controller";
import userModel from "../models/users_model";
import bcrypt from "bcryptjs";

interface AuthenticatedRequest extends Request {
    userId?: string;
}

class UserController extends BaseController<typeof userModel> {
    constructor() {
        super(userModel);
    }

    async getByEmail(req: Request, res: Response): Promise<void> {
        try {
            const items = await this.model.find({ email: req.body.email });
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

    async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
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
    }
    
    async update(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const { name, bio, allergies, img } = req.body;

            const updatedUser = await this.model.findByIdAndUpdate(
                userId,
                { name, bio, allergies, img },
                { new: true }
            );

            if (!updatedUser) {
                res.status(404).send({ message: "User not found" });
                return;
            }

            res.status(200).send(updatedUser);
        } catch (error) {
            console.error("Error updating user:", error); // Log error
            res.status(400).send(error);
        }
    }
}

const usersController = new UserController();

export default usersController;