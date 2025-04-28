import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the tag
 *       example:
 *         name: "Vegan"
 */


/**
 * Interface representing a Tag document in MongoDB.
 * @interface
 */
export interface ITag {
  /**
   * The name of the tag.
   * @type {string}
   * @required
   */
  name: string;
}

/**
 * Schema for the Tag model.
 * Defines the structure of a Tag document in MongoDB.
 * @type {mongoose.Schema}
 */
const tagSchema = new mongoose.Schema<ITag>({
  /**
   * The name of the tag.
   * @type {String}
   * @required
   */
  name: {
    type: String,
    required: true,
  },
});

/**
 * The Tag model based on the tagSchema.
 * @type {mongoose.Model<ITag>}
 */
const tagModel = mongoose.model<ITag>("Tag", tagSchema);

export default tagModel;
