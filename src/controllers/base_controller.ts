import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
    model: Model<T>;
    constructor(model: any) {
        this.model = model;
    }

    //get all or get by id based on reqest params
    async get(req: Request, res: Response) {
        const filter = req.params._id;
        try {
            if (filter) {
                const item = await this.model.find({ _id: filter });
                if (item)
                    res.send(item);
                else
                    res.status(404)
            } else {
                const items = await this.model.find();
                res.send(items);
            }
        } catch (error) {
            res.status(400).send(error);
        }
    };

    // לא מיותר!
    // async getById(req: Request, res: Response) {
    //     const id = req.params.id;
    //     try {
    //         const item = await this.model.findById(id);
    //         if (item != null) {
    //             res.send(item);
    //         } else {
    //             res.status(404).send("not found");
    //         }
    //     } catch (error) {
    //         res.status(400).send(error);
    //     }
    // };

    async update(req: Request, res: Response) {
        const id = req.body._id;
        const body = req.body;
        try {
            const item = await this.model.findByIdAndUpdate(id, body, { new: true });
            res.send(item);
        } catch (error) {
            res.status(400).send(error);
        }
    };

    async create(req: Request, res: Response) {
        const body = req.body;
        try {
            const item = await this.model.create(body);
            res.status(201).send(item);
        } catch (error) {
            res.status(400).send(error);
        }
    };

    async delete(req: Request, res: Response) {
        const id = req.params._id;
        try {
            const rs = await this.model.findByIdAndDelete(id);
            res.status(200).send(rs);
        } catch (error) {
            res.status(400).send(error);
        }
    };
}

// const createController = <T>(model: Model<T>) => {
//     return new BaseController(model);
// }

export default BaseController
