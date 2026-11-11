const mongoose = require("mongoose");

const db = {
  mongoose,
  User: require("./users.model.js")(mongoose),
  Seller: require("./sellers.model.js")(mongoose),
  Questionnaire: require("./questionnaires.model.js")(mongoose),
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
  console.info("Users service connected to MongoDB.");
};

module.exports = db;
