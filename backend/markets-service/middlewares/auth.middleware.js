import jwt from "jsonwebtoken";
import "dotenv/config";
import logger from "../utils/logger.js";

export const authenticateToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Never log bearer tokens or decoded authentication payloads.
    logger.warn(`Authentication failed: ${error.message}`);
    return null;
  }
};

export const authorizeRole = (user, role) => {
  if (!user) {
    logger.warn("Access denied: attempted restricted action without a valid login.");
    throw new Error("Access denied: missing or invalid token.");
  }

  if (user.role !== role) {
    logger.warn(`Access forbidden: user ${user.id} attempted an action requiring ${role}.`);
    throw new Error("Access forbidden: insufficient privileges.");
  }
};
