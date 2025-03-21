import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bodyParser from "body-parser";
import recipe_routes from "./routes/recipe_routes";
import comments_routes from "./routes/comments_route";
import auth_routes from "./routes/auth_routes";
import users_routes from "./routes/users.routes";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from 'path';


const app = express();

app.use(
  cors({
    origin: ["http://node66.cs.colman.ac.il", "http://193.106.55.226", "http://localhost:5173"],    
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Add "Authorization" to allowed headers
  })
);

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Information",
    },
    servers: [
      {
        url: `http://node66.cs.colman.ac.il:${process.env.PORT || 4000}`,
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts","./src/models/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const initApp = (): Promise<Express> => {
  return new Promise<Express>((resolve, reject) => {
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function () {
      console.log("Connected to the database");
    });
    if (!process.env.DB_CONNECT) {
      reject("DB_CONNECT is not defined");
    } else {
      mongoose
      .connect(process.env.DB_CONNECT)
      .then(() => {
        console.log("Connected to the database");
        app.use('/public', express.static('public'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use("/recipe", recipe_routes);
        app.use("/comments", comments_routes);
        app.use("/auth", auth_routes);
        app.use("/users", users_routes);
        app.use(express.static("public"));
        resolve(app);
      })
      .catch((err) => {
        console.error("DB Connection Error:", err);
        reject(err);
      });
    }
  });
};

export default initApp;
