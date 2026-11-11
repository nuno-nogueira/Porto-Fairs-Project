import mongoose from "mongoose";
import "dotenv/config";
import Rating from "./ratings.model.js";

const db = {
  mongoose,
  Rating: Rating(mongoose),
};

function getMongoUrl() {
  if (process.env.MONGO_URL) return process.env.MONGO_URL;

  const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST } = process.env;
  if (!DB_USER || !DB_PASSWORD || !DB_NAME || !DB_HOST) {
    throw new Error(
      "MongoDB is not configured. Set MONGO_URL or DB_USER, DB_PASSWORD, DB_NAME and DB_HOST.",
    );
  }

  return `mongodb+srv://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
}

db.connect = async () => {
  await mongoose.connect(getMongoUrl());
  console.info("Ratings service connected to MongoDB.");
};

export default db;
