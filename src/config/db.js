const mongoose = require("mongoose");
const dns = require("dns");
const logger = require("./logger");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CNN);
    logger.info("Base de datos conectada");
  } catch (error) {
    logger.error(`Error conectando a la base de datos: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
