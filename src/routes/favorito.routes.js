const { Router } = require("express");
const authenticate = require("../middlewares/authenticate");
const { getFavoritos, addFavorito, removeFavorito } = require("../controllers/favorito.controller");

const router = Router();

router.get("/", authenticate, getFavoritos);
router.post("/:productoId", authenticate, addFavorito);
router.delete("/:productoId", authenticate, removeFavorito);

module.exports = router;
