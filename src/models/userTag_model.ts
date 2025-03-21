import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     UserTag:
 *       type: object
 *       required:
 *         - user
 *         - tag
 *       properties:
 *         user:
 *           type: string
 *           description: The ID of the user associated with this tag
 *         tag:
 *           type: string
 *           description: The ID of the tag associated with this user
 *       example:
 *         user: "60b8d295f1d2c70015f8aabc"
 *         tag: "60b8d295f1d2c70015f8aadf"
 */


/**
 * Interface representing a UserTag document in MongoDB.
 * This interface associates a user with a tag.
 * @interface
 * @extends {mongoose.Document}
 */
interface IUserTag extends mongoose.Document {
  /**
   * The user associated with this tag.
   * @type {mongoose.Schema.Types.ObjectId}
   * @required
   */
  user: mongoose.Schema.Types.ObjectId;

  /**
   * The tag associated with this user.
   * @type {mongoose.Schema.Types.ObjectId}
   * @required
   */
  tag: mongoose.Schema.Types.ObjectId;
}

/**
 * Schema for the UserTag model.
 * This schema defines the relationship between users and tags in MongoDB.
 * @type {mongoose.Schema}
 */
const userTagSchema = new mongoose.Schema<IUserTag>({
  /**
   * The user associated with this tag.
   * This field references the User model.
   * @type {mongoose.Schema.Types.ObjectId}
   * @required
   */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  /**
   * The tag associated with this user.
   * This field references the Tag model.
   * @type {mongoose.Schema.Types.ObjectId}
   * @required
   */
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true,
  },
});

/**
 * The UserTag model based on the userTagSchema.
 * This model represents the relationship between a user and their tags.
 * @type {mongoose.Model<IUserTag>}
 */
const userTagModel = mongoose.model<IUserTag>("UserTag", userTagSchema);

export default userTagModel;
