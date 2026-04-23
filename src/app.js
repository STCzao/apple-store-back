const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const categoriaRoutes = require("./routes/categoria.routes");
const productoRoutes = require("./routes/producto.routes");
const favoritoRoutes = require("./routes/favorito.routes");
const errorHandler = require("./middlewares/errorHandler");
const { authLimiter, generalLimiter } = require("./middlewares/rateLimiter");
const logger = require("./config/logger");

const app = express();

app.use(helmet());

app.use((req, _res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  next();
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? "warn" : "http";
    logger[level](`${req.method} ${req.path} — ${res.statusCode} — ${duration}ms`);
  });
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/usuario", generalLimiter, usuarioRoutes);
app.use("/api/categoria", generalLimiter, categoriaRoutes);
app.use("/api/producto", generalLimiter, productoRoutes);
app.use("/api/favorito", generalLimiter, favoritoRoutes);

app.use((_req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

app.use(errorHandler);

module.exports = app;
