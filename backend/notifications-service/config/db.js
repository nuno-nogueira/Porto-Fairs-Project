const mongoose = require("mongoose");

async function connectDatabase() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;
  if (!mongoUrl) {
    throw new Error("Set MONGO_URL for the Notifications Service.");
  }

  await mongoose.connect(mongoUrl);
  console.info("Notifications service connected to MongoDB.");
  return mongoose;
}

module.exports = {
  mongoose,
  connectDatabase,
  Notification: require("../model/Notification.js"),
};
