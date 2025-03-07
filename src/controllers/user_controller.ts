import { Request, Response } from "express";
import BaseController from "./base_controller";
import userModel from "../models/users_model";
import bcrypt from "bcryptjs";

class UsersController extends BaseController<typeof userModel> {
    constructor(model: typeof userModel) {
        super(model);
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
}

const usersController = new UsersController(userModel);

export default usersController;