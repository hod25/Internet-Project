import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import commentsModel from "../models/comment_model";
import { Express } from "express";
import userModel, { IUser } from "../models/users_model";

let app: Express;
const baseUrl = "/comments";

type User = IUser & {
  accessToken?: string,
  refreshToken?: string
};

const testUser: User  = {
  email: "arbel.tzoran.98@gmail.com",
  password: "testpassword",
  name: "user1",
  last_name: "last1",
  background: "background1",
  image: "image1",
  tags: ["tag1"],
  profile: "profile1",
}

const testUser2: User  = {
  email: "fainman@mail.tau.ac.il",
  password: "wonderwoman",
  name: "gal",
  last_name: "gadot",
  background: "background2",
  image: "image2",
  tags: ["tag2"],
  profile: "profile2",  
};

// let accessToken: string;


beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await commentsModel.deleteMany();
  await userModel.deleteMany();
  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send(testUser);
  testUser.accessToken = res.body.accessToken;
  testUser.refreshToken = res.body.refreshToken;
  expect(testUser.refreshToken).toBeDefined();
});

afterAll(async () => {
  console.log("afterAll");
  await mongoose.connection.close();
});


let commentId = "";
const testComment = {
  comment: "Test comment",
  recipeId: "123456",
  owner: "Hod",
};

const invalidComment = {
  comment: "Test comment",
};

describe("Commnents test suite", () => {
  test("Comment test get all", async () => {
    const response = await request(app).get(baseUrl);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });


  test("Test Addding new comment", async () => {
    const response = await request(app).post(baseUrl).set({ authorization: "JWT " + testUser.accessToken }).send(testComment);
    expect(response.statusCode).toBe(201);
    expect(response.body.comment).toBe(testComment.comment);
    expect(response.body.recipeId).toBe(testComment.recipeId);
    expect(response.body.owner).toBe(testComment.owner);
    commentId = response.body._id;
  });

  test("Test Addding invalid comment", async () => {
    const response = await request(app).post(baseUrl).set({ authorization: "JWT " + testUser.accessToken }).send(invalidComment);
    expect(response.statusCode).not.toBe(201);
  });

  test("Test get all comments after adding", async () => {
    const response = await request(app).get(baseUrl);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("Test get comment by owner", async () => {
    const response = await request(app).get(baseUrl+ "?owner=" + testComment.owner);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].owner).toBe(testComment.owner);
  });

  test("Test get comment by id", async () => {
    const response = await request(app).get(baseUrl +"/" + commentId);
    expect(response.statusCode).toBe(200);    
    expect(response.body._id).toBe(commentId);
  });

  test("Test get comment by id fail", async () => {
    const response = await request(app).get(baseUrl +"/67447b032ce3164be7c4412d");
    expect(response.statusCode).toBe(404);
  });
});
