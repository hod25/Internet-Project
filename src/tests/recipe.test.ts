import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import { IRecipe } from "../models/recipe_model";

var app: Express;

var base = "/recipe/";
const testRecipe: IRecipe = {
  title: "hamburger",
  image: "../burger.jpg",
  ingredients: [{"name":"meat"},{"name":"tomato"}],
  tags: [{"name":"gluten"}],
  owner: "user1",
  likes: 3,
}

// test for recipe 
describe("Recipe Tests", () => {
  test("Recipe test create", async () => {
    const response = await request(app).post(base).send(testRecipe);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(testRecipe.title);
    expect(response.body.image).toBe(testRecipe.image);
    expect(response.body.ingredients).toBe(testRecipe.ingredients);
    expect(response.body.tags).toBe(testRecipe.tags);
    expect(response.body.owner).toBe(testRecipe.owner);
    expect(response.body.likes).toBe(testRecipe.likes);    
  });

});

