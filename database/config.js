const mongoose = require("mongoose");
const logger = require("../config/logger");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CNN);
    logger.dbConnected("Database Connected");
  } catch (error) {
    logger.dbError(error);
    throw new Error("Error connecting to database");
  }
};

module.exports = {
  dbConnection,
};
