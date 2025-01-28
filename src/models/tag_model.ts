import mongoose from "mongoose";

export interface ITag {
  name: string;
}

const tagSchema = new mongoose.Schema<ITag>({
    name: {
        type: String,
        required: true,
    },
});

const tagModel = mongoose.model<ITag>("Tag", tagSchema);

export default tagModel;