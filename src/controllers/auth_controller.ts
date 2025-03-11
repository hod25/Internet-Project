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

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authorization = req.header("authorization");
        const token = authorization && authorization.split(" ")[1];

        if (!token) {
            res.status(401).json({ message: "Access Denied" });
            return;
        }

        if (!process.env.TOKEN_SECRET) {
            res.status(500).json({ message: "Server Error: Missing TOKEN_SECRET" });
            return;
        }

        try {
            // ניסיון לאמת עם JWT מקומי
            const payload = jwt.verify(token, process.env.TOKEN_SECRET) as { _id: string };
            req.params.userId = payload._id;
            return next(); // עצירת הפונקציה לאחר אימות מוצלח
        } catch (jwtError: unknown) {
            if (jwtError instanceof Error) {
                console.warn("🔴 JWT לא תקף:", jwtError.message);
            }
        }

        // ניסיון לאמת עם Google Token באופן בסיסי
        try {
            const decodedGoogleToken = jwt.decode(token) as { sub?: string } | null;
            if (decodedGoogleToken?.sub) {
                req.params.userId = decodedGoogleToken.sub;
                return next(); // עצירת הפונקציה לאחר אימות מוצלח
            }
        } catch (googleError: unknown) {
            if (googleError instanceof Error) {
                console.error("🔴 שגיאה בפענוח Google Token:", googleError.message);
            }
        }

        res.status(401).json({ message: "Access Denied: Invalid Token" });
        return;
    } catch (error: unknown) {
        let errorMessage = "Internal Server Error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("🔴 שגיאה באימות:", errorMessage);
        res.status(500).json({ message: errorMessage });
        return;
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
            email: user.email,
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
export const getUserFromGoogleToken = (req: Request, res: Response) : void => {
    try {
        var { token } = req.query;
        if (!token) {
            res.status(400).json({ message: "Token is required" });
            return;
        }
        if (!token || typeof token !== 'string') {
            res.status(400).json({ message: "Token is required and must be a string" });
            return;
        }

        // ✅ מפרקים את ה-Token ללא אימות
        const decoded = jwt.decode(token) as { email?: string} | null;

        if (!decoded) {
            res.status(400).json({ message: "Invalid token" });
        }

        // ✅ מחזירים את פרטי המשתמש כפי שמופיעים ב-Token
        res.json({
            email: decoded?.email
        });
        return;
    } catch (error) {
        console.error("Error decoding Google token:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
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
    authMiddleware,
    getUserFromGoogleToken,
    googleLogin, // Add googleLogin to the exports
};