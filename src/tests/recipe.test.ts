import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import { Recipe } from "../models/recipe";

var app: Express;

var base = "/recipe";
// test for recipe 
describe("Recipe Tests", () => {
  test("Recipe test create", async () => {
    const response = await request(app).post(base);  
    .send({
      id: "123", 
      title: "tile",
      image: "url",//לבדוק
      ingredients: "test",
      tags: "test",
      owner: "test",
      likes: 3,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  }); 
});

