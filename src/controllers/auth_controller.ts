import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/users_model';
import userTagModel from '../models/userTag_model';
import tagModel from "../models/tag_model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';

interface AuthenticatedRequest extends Request {
  userId?: string; // Add userId to the Request type
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // חילוץ הטוקן מתוך הכותרת
  const token = req.headers.authorization?.split(" ")[1];

  // אם אין טוקן, מחזירים שגיאה
  if (!token) {
    return res.status(401).send({ message: "No token provided" });
  }

  try {
    // אימות הטוקן
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!); // אנו מצפים שה-decoded יכיל את ה-id של המשתמש
    console.log("Decoded token:", decoded); // לוג להדפסת המידע שדקוד מהטוקן
    
    // חיפוש המשתמש על פי ה-id שמתקבל מהטוקן
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).send({ message: "Invalid token" });
    }

    // אם המשתמש נמצא, מכניסים את ה-id שלו ל-req
    req.userId = user._id;

    // ממשיכים לעבד את הבקשה
    next();
  } catch (error) {
    // אם קרתה שגיאה במהלך אימות הטוקן, מחזירים שגיאה
    res.status(401).send({ message: "Unauthorized", error });
  }
};


const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const existingUser = await userModel.findOne({ email: req.body.email });
        if (existingUser) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userModel.create({
            email: req.body.email,
            password: hashedPassword,
            name: req.body.name,
            last_name: req.body.last_name,
            background: req.body.background,
            image: req.body.image,
            profile: req.body.profile
        });

        const tags = req.body.tags;
        const userId = user._id;

        // יצירת תגיות אם הן לא קיימות ושיוך למשתמש
        const tagDocs = await Promise.all(tags.map(async (tagName: string) => {
            let tag = await tagModel.findOne({ name: tagName });
            if (!tag) {
                tag = await tagModel.create({ name: tagName });
            }
            return { user: userId, tag: tag._id };
        }));

        await userTagModel.insertMany(tagDocs);

        const fullUser = {
            ...user.toObject(),
            tags
        };

        res.status(201).json(fullUser);
        return;
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
        return;
    }
};

type tTokens = {
    accessToken: string,
    refreshToken: string
}

const generateToken = (userId: string): tTokens | null => {

    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    // generate token
    const random = Math.random().toString();

    const accessToken = jwt.sign({
        _id: userId,
        random: random
    },
        process.env.TOKEN_SECRET,
        { expiresIn: parseInt(process.env.TOKEN_EXPIRATION||'1') });

    const refreshToken = jwt.sign({
        _id: userId,
        random: random
    },
        process.env.TOKEN_SECRET,
        { expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRATION||'1') });
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};

const login = async (req: Request, res: Response) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).send('wrong username or password');
            return;
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(400).send('wrong username or password');
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send('Server Error');
            return;
        }
        // generate token
        const tokens = generateToken(user._id);
        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id,
            token: tokens.accessToken // Ensure token is included in the response
        });

    } catch (err) {
        res.status(400).send(err);
    }
};

type tUser = Document<unknown, {}, IUser> & IUser & Required<{
    _id: string;
}> & {
    __v: number;
}
const verifyRefreshToken = (refreshToken: string | undefined) => {
    return new Promise<tUser>((resolve, reject) => {
        //get refresh token from body
        if (!refreshToken) {
            reject("fail");
            return;
        }
        //verify token
        if (!process.env.TOKEN_SECRET) {
            reject("fail");
            return;
        }
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
            if (err) {
                reject("fail");
                return
            }
            //get the user id fromn token
            const userId = payload._id;
            try {
                //get the user form the db
                const user = await userModel.findById(userId);
                if (!user) {
                    reject("fail");
                    return;
                }
                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    user.refreshToken = [];
                    await user.save();
                    reject("fail");
                    return;
                }
                const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
                user.refreshToken = tokens;

                resolve(user);
            } catch (err) {
                reject("fail");
                return;
            }
        });
    });
}

const logout = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        await user.save();
        res.status(200).send("success");
    } catch (err) {
        res.status(400).send("fail");
    }
};

const refresh = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        if (!user) {
            res.status(400).send("fail");
            return;
        }
        const tokens = generateToken(user._id);

        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.status(200).send(
            {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                _id: user._id
            });
        //send new token
    } catch (err) {
        res.status(400).send("fail");
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).send('Invalid Google token');
      return;
    }

    const { sub, email, name, picture } = payload;

    let user = await userModel.findOne({ email });
    if (!user) {
      user = await userModel.create({
        email,
        name,
        image: picture,
        googleId: sub,
      });
    }

    const tokens = generateToken(user._id);
    if (!tokens) {
      res.status(500).send('Server Error');
      return;
    }

    if (!user.refreshToken) {
      user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();

    res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: user._id,
      token: tokens.accessToken,
    });
  } catch (error) {
    res.status(400).send('Google login failed');
  }
};

type Payload = {
    _id: string;
};


export default {
    register,
    login,
    refresh,
    logout,
    googleLogin, // Add googleLogin to the exports
};