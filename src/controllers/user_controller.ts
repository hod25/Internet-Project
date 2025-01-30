import { Request, Response } from "express";
import BaseController from "./base_controller";
import userModel from "../models/users_model"

class users_controller<userModel> extends BaseController<userModel> {
    constructor(model: userModel) {
        super(model);
    }

    async getByEmail(req: Request, res: Response) {
        try {
            const items = await this.model.find({ ["email"]: req.body.email });
            res.send(items);
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

const userscontroller = new users_controller(userModel);

export default userscontroller;
