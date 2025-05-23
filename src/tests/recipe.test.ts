import request, { Response } from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express, response } from "express";
import recipeModel, { IRecipe } from "../models/recipe_model";
import ingredientModel from "../models/ingredient_model"
import tagModel from "../models/tag_model";
import recipeTagModel from "../models/recipeTag_model"
import userModel, { IUser } from "../models/users_model";

var app: Express;
var recipeId: "";

type User = IUser & {
  accessToken?: string,
  refreshToken?: string
};

const testUser: User = {
  email: "arbel.tzoran.98@gmailx.com",
  password: "testpassword",
  name: "user1",
  last_name: "last1",
  background: "background1",
  image: "image1",
  tags: ["tag1"],
  profile: "profile1",
}

const baseUrl = "/recipe/";
const testRecipe: IRecipe = {
  title: "hamburger",
  image: "../images/burger.jpg",
  ingredients: ["meat","tomato"],
  tags: ["gluten"],
  owner: "user1",
  likes: 0,
}

const testRecipe2: IRecipe = {
  title: "pasta",
  image: "../images/pasta.jpg",
  ingredients: ["dough","olive oil"],
  tags: ["lactose"],
  owner: "user3",
  likes: 0
}


beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();

  await ingredientModel.deleteMany();
  await recipeTagModel.deleteMany();
  await tagModel.deleteMany();
  await recipeModel.deleteMany();
  await userModel.deleteMany();
  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send(testUser);
  testUser.accessToken = res.body.accessToken;
  testUser.refreshToken = res.body.refreshToken;
  expect(testUser.refreshToken).toBeDefined();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

// test for recipe 
describe("Recipe Tests", () => {
  // at first the db is empty
  test("Recipe test get all", async () => {
    const response = await request(app).get(baseUrl);
    expect(response.statusCode).toBe(404);
  });

  test("Recipe test create", async () => {
    const response = await request(app).post(baseUrl).set({ authorization: "JWT " + testUser.accessToken }).send(testRecipe);
    expect(response.statusCode).toBe(201);
    await validateRecipeResponse(response, testRecipe);
    recipeId = response.body._id;
  });

  //after creation there is one document
  test("Recipe test get all", async () => {
   const response = await request(app).get(baseUrl);
   expect(response.statusCode).toBe(200);   
   expect(response.body.totalPages).toBe(1);
  });

  test("Recipe test get by id", async () => {
    const response = await request(app).get(baseUrl + recipeId);
    expect(response.statusCode).toBe(200);
    await validateRecipeResponse(response, testRecipe);
  });
  

  test("Recipe test update", async () => {
    testRecipe.title = "pizza";
    testRecipe.image = "../images/pizza.jpg";
    testRecipe.ingredients = ["dough","tomato"];
    testRecipe.tags = ["vegeterian","eggs"];
    testRecipe.owner = "user2";
    testRecipe.likes = 5;
    const item = {
      "_id":recipeId,
      "title":testRecipe.title,
      "image":testRecipe.image,
      "ingredients":testRecipe.ingredients,
      "tags":testRecipe.tags,
      "owner":testRecipe.owner,
      "likes":testRecipe.likes
    }
    const response = await request(app).put(baseUrl +recipeId).set({ authorization: "JWT " + testUser.accessToken }).send(item);
        
    expect(response.statusCode).toBe(200);
    await validateRecipeResponse(response, testRecipe);
  });

  test("Recipe test get by user", async () => {
    const response = await request(app).get(baseUrl + "user/" + testRecipe.owner);
    expect(response.statusCode).toBe(200);
    expect(response.body[0]._id).toBe(recipeId);
  });

  test("Recipe test get by tag and title", async () => {
    const response = await request(app).get(baseUrl + "search?tags=vegeterian,eggs&title=pizza");
    expect(response.statusCode).toBe(200);
    expect(response.body[0]._id).toBe(recipeId);
  });

  test("Recipe test create", async () => {
    const response = await request(app).post(baseUrl).set({ authorization: "JWT " + testUser.accessToken }).send(testRecipe2);
    expect(response.statusCode).toBe(201);
    await validateRecipeResponse(response, testRecipe2);
    recipeId = response.body._id;
  });

  test("Recipe test get by user2", async () => {
    const response = await request(app).get(baseUrl + "user/" + testRecipe2.owner);
    expect(response.statusCode).toBe(200);
    expect(response.body[0]._id).toBe(recipeId);
    expect(response.body.length).toBe(1);
  });

  test("Recipe test delete", async () => {
    const response = await request(app).delete(baseUrl + recipeId).set({ authorization: "JWT " + testUser.accessToken });
    expect(response.statusCode).toBe(200);
    const response2 = await request(app).get(baseUrl + recipeId);
    
    expect(response2.statusCode).toBe(404);
  });
  test("Recipe create random from rest", async () => {
    const response = await request(app).post(baseUrl + "/random").set({ authorization: "JWT " + testUser.accessToken });
    expect(response.statusCode).toBe(201);
  });

});

async function parseBody(body: ReadableStream<Uint8Array> | IRecipe): Promise<IRecipe> {
  if (body instanceof ReadableStream) {
      const text = await streamToText(body);
      return JSON.parse(text);
  }
  return body;
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      result += decoder.decode(value, { stream: true });
    }
  }

  result += decoder.decode();
  return result;
}

async function validateRecipeResponse(response: request.Response, testRecipe: IRecipe) {
  if (response.body) {
    const body = await parseBody(response.body);
    if (!Array.isArray(body)) {
      expect(body.title).toBe(testRecipe.title);
      expect(body.image).toBe(testRecipe.image);
      expect(body.owner).toBe(testRecipe.owner);
      expect(body.likes).toBe(testRecipe.likes);
    }
    else {
      expect(body[0].title).toBe(testRecipe.title);
      expect(body[0].image).toBe(testRecipe.image);
      expect(body[0].owner).toBe(testRecipe.owner);
      expect(body[0].likes).toBe(testRecipe.likes);
    }
  }
}