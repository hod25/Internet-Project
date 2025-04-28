import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *         - last_name
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email address
 *         password:
 *           type: string
 *           description: The user's password
 *         name:
 *           type: string
 *           description: The user's first name
 *         last_name:
 *           type: string
 *           description: The user's last name
 *         background:
 *           type: string
 *           description: A brief background or description of the user
 *           default: ""
 *         image:
 *           type: string
 *           description: The user's profile image URL
 *           default: ""
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of tags associated with the user
 *         profile:
 *           type: string
 *           description: A string representing the user's profile
 *           default: ""
 *         refreshToken:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of refresh tokens associated with the user
 *           default: []
 *       example:
 *         email: "user@example.com"
 *         password: "password123"
 *         name: "John"
 *         last_name: "Doe"
 *         background: "Software developer with a passion for learning."
 *         image: "http://example.com/profile.jpg"
 *         tags: ["developer", "tech enthusiast"]
 *         profile: "Profile description here"
 *         refreshToken: ["token1", "token2"]
 */


/**
 * Interface representing a User document in MongoDB.
 * @interface
 */
export interface IUser {
  /**
   * The user's email address.
   * @type {string}
   * @required
   * @unique
   */
  email: string;

  /**
   * The user's password.
   * @type {string}
   * @required
   */
  password: string;

  /**
   * The user's first name.
   * @type {string}
   * @required
   */
  name: string;

  /**
   * The user's last name.
   * @type {string}
   * @required
   */
  last_name: string;

  /**
   * A brief background or description of the user.
   * @type {string}
   * @default ""
   */
  background: string;

  /**
   * The unique identifier for the user (optional).
   * @type {string}
   * @optional
   */
  _id?: string;

  /**
   * A list of refresh tokens associated with the user.
   * @type {string[]}
   * @optional
   * @default []
   */
  refreshToken?: string[];

  /**
   * The user's profile image URL.
   * @type {string}
   * @optional
   * @default ""
   */
  image?: string;

  /**
   * A list of tags associated with the user.
   * @type {string[]}
   * @optional
   */
  tags?: string[];

  /**
   * A string representing the user's profile.
   * @type {string}
   * @optional
   * @default ""
   */
  profile?: string;
}

/**
 * Schema for the User model.
 * Defines the structure of a User document in MongoDB.
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema<IUser>({
  /**
   * The user's email address.
   * @type {String}
   * @required
   * @unique
   */
  email: {
    type: String,
    required: true,
    unique: true,
  },

  /**
   * The user's password.
   * @type {String}
   * @required
   */
  password: {
    type: String,
    required: true,
  },

  /**
   * The user's first name.
   * @type {String}
   * @required
   */
  name: {
    type: String,
    required: true,
  },

  /**
   * The user's last name.
   * @type {String}
   * @required
   */
  last_name: {
    type: String,
    required: true,
  },

  /**
   * A brief background or description of the user.
   * @type {String}
   * @default ""
   */
  background: {
    type: String,
    default: "",
  },

  /**
   * The user's profile image URL.
   * @type {String}
   * @default ""
   */
  image: {
    type: String,
    default: "",
  },

  /**
   * A string representing the user's profile.
   * @type {String}
   * @default ""
   */
  profile: {
    type: String,
    default: "",
  },

  /**
   * A list of refresh tokens associated with the user.
   * @type {String[]}
   * @default []
   */
  refreshToken: {
    type: [String],
    default: [],
  },
});

/**
 * The User model based on the userSchema.
 * @type {mongoose.Model<IUser>}
 */
const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;
