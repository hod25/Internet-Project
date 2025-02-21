import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bodyParser from "body-parser";
import recipe_routes from "./routes/recipe_routes";
import comments_routes from "./routes/comments_route";
// import auth_routes from "./routes/auth_routes";
import users_routes from "./routes/users.routes";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
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
        url: `http://localhost:${process.env.PORT}`,
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Path to the API docs
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
          app.use(bodyParser.json());
          app.use(bodyParser.urlencoded({ extended: true }));
          app.use("/recipe", recipe_routes);
          app.use("/comments", comments_routes);
          app.use("/auth", recipe_routes);
          app.use("/users", users_routes);
          resolve(app);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};

export default initApp;
