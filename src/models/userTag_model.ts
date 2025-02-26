import express from 'express';
import mongoose from "mongoose";

interface IUserTag extends mongoose.Document {
    user: mongoose.Schema.Types.ObjectId;
    tag: mongoose.Schema.Types.ObjectId;
}
const userTagSchema = new mongoose.Schema<IUserTag>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: true,
    },

});
  
const userTagModel = mongoose.model<IUserTag>("UserTag", userTagSchema);
  
export default userTagModel;