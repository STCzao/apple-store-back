const { createLogger, format, transports } = require("winston");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

const consoleFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.colorize({ all: true }),
  format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
);

const fileFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

const logger = createLogger({
  level: isProduction ? "warn" : "debug",
  levels: { error: 0, warn: 1, info: 2, http: 3, debug: 4 },
  transports: [
    new transports.Console({ format: isProduction ? format.json() : consoleFormat }),
    new transports.File({ filename: path.join("logs", "error.log"), level: "error", format: fileFormat }),
    new transports.File({ filename: path.join("logs", "combined.log"), format: fileFormat }),
  ],
  exitOnError: false,
});

require("winston").addColors({ error: "red", warn: "yellow", info: "green", http: "magenta", debug: "blue" });

module.exports = logger;
