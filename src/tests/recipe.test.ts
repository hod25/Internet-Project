import request, { Response } from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import recipeModel, { IRecipe } from "../models/recipe_model";

var app: Express;
var recipeId: "";

var base = "/recipe/";
const testRecipe: IRecipe = {
  title: "hamburger",
  image: "../images/burger.jpg",
  ingredients: [{"name":"meat"},{"name":"tomato"}],
  tags: [{"name":"gluten"}],
  owner: "user1",
  likes: 0,
}

const testRecipe2: IRecipe = {
  title: "pasta",
  image: "../images/pasta.jpg",
  ingredients: [{"name":"dough"},{"name":"olive oil"}],
  tags: [{"name":"lactose"}],
  owner: "user3",
  likes: 0,
}


beforeAll(async () => {
  app = await initApp();
  await recipeModel.deleteMany();
  //const response = await request(app).post("/auth/register").send(testUser);
  //const response2 = await request(app).post("/auth/login").send(testUser);
  //expect(response2.statusCode).toBe(200);
  //accessToken = response2.body.token;
  // testPost.owner = response2.body._id;
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});

// test for recipe 
describe("Recipe Tests", () => {
  // at first the db is empty
  test("Recipe test get all", async () => {
    const response = await request(app).get(base);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Recipe test create", async () => {
    const response = await request(app).post(base).send(testRecipe);
    expect(response.statusCode).toBe(201);
    validateRecipeResponse(response, testRecipe);
    recipeId = response.body._id;
  });

  //after creation there is one document
  test("Recipe test get all", async () => {
   const response = await request(app).get(base);
   expect(response.statusCode).toBe(200);
   expect(response.body.length).toBe(1);
  });

  test("Recipe test get by id", async () => {
    const response = await request(app).get(base + recipeId);
    expect(response.statusCode).toBe(200);
    validateRecipeResponse(response, testRecipe);
  });
  

  test("Recipe test update", async () => {
    testRecipe.title = "pizza";
    testRecipe.image = "../images/pizza.jpg";
    testRecipe.ingredients = [{"name":"dough"},{"name":"tomato"}];
    testRecipe.tags = [{"name":"vegeterian"}];
    testRecipe.owner = "user2";
    testRecipe.likes = 5;
    const response = await request(app).put(base + recipeId).send(testRecipe);
    expect(response.statusCode).toBe(200);
    validateRecipeResponse(response, testRecipe);
  });

  test("Recipe test get by user", async () => {
    const response = await request(app).get(base + "user/" + testRecipe.owner);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(recipeId);
  });

  test("Recipe test get by tag and title", async () => {
    const response = await request(app).get(base + testRecipe.tags[0].name + "/" + testRecipe.title);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(recipeId);
  });

  test("Recipe test create", async () => {
    const response = await request(app).post(base).send(testRecipe2);
    expect(response.statusCode).toBe(201);
    validateRecipeResponse(response, testRecipe2);
    recipeId = response.body._id;
  });

  test("Recipe test get by user2", async () => {
    const response = await request(app).get(base + "user/" + testRecipe2.owner);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(recipeId);
    expect(response.body.length).toBe(1);
  });

  test("Recipe test delete", async () => {
    const response = await request(app).delete(base + recipeId);
    expect(response.statusCode).toBe(200);
    const response2 = await request(app).get(base + recipeId);
    expect(response2.statusCode).toBe(404);
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
      expect(body.title).toBe(testRecipe.title);
      expect(body.image).toBe(testRecipe.image);
      expect(body.ingredients).toBe(testRecipe.ingredients);
      expect(body.tags).toBe(testRecipe.tags);
      expect(body.owner).toBe(testRecipe.owner);
      expect(body.likes).toBe(testRecipe.likes);
    }
  }
});
