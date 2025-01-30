import mongoose from "mongoose";

export interface IUser {
  email: string;
  password: string;
  name: string;
  last_name: string;
  _id?: string;//לא צריך?
  // refreshToken?: string[];
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  // refreshToken: {
  //   type: [String],
  //   default: [],
  // }
});

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;