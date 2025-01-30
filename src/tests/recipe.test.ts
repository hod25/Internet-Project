import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import { Recipe } from "../models/recipe";
import { IRecipe } from "../models/recipe_model";

var app: Express;

var base = "/recipe";
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
    const response = await request(app).post(base);  
    .send({
      title: "tile",
      image: "url",//לבדוק
      ingredients: "",
      tags: "test",
      owner: "test",
      likes: 3,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  }); 
});

