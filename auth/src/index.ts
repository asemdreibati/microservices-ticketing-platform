import mongoose from "mongoose";

import { app } from "./app";
import "dotenv/config";

const start = async () => {
  console.log("checking workflow for merge.....");

  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.TEMP_2FA_TOKEN_SECRET) {
    throw new Error("TEMP_2FA_TOKEN_SECRET must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM must be defined");
  }
  if (!process.env.EMAIL_PASS) {
    throw new Error("EMAIL_PASS must be defined");
  }
  if (!process.env.MLINKS_VERIFICATION_REDIRECTION) {
    throw new Error("MLINKS_VERIFICATION_REDIRECTION must be defined");
  }
  if (!process.env.GITHUB_CLIENT_ID) {
    throw new Error("GITHUB_CLIENT_ID must be defined");
  }
  if (!process.env.GITHUB_CLIENT_SECRET) {
    throw new Error("GITHUB_CLIENT_SECRET must be defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to MongoDb");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!!!!!");
  });
};

start();
