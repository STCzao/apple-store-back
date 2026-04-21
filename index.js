require("dotenv").config();

const logger = require("./src/config/logger");

const requiredEnvVars = [
  "MONGODB_CNN",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "RESEND_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  logger.error(`Variables de entorno faltantes: ${missing.join(", ")}`);
  process.exit(1);
}

if (!["development", "production", "test"].includes(process.env.NODE_ENV)) {
  process.env.NODE_ENV = "development";
}

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en puerto ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start();
