const { Router } = require("express");
const authenticate = require("../middlewares/authenticate");
const { esAdmin } = require("../middlewares/authorize");
const validarCampos = require("../middlewares/validarCampos");
const { crearCategoriaValidator, actualizarCategoriaValidator } = require("../validators/categoria.validator");
const { categoriasGet, categoriaGet, categoriaPost, categoriaPatch, categoriaDelete } = require("../controllers/categoria.controller");

const router = Router();

router.get("/", categoriasGet);
router.get("/:id", categoriaGet);
router.post("/", authenticate, esAdmin, crearCategoriaValidator, validarCampos, categoriaPost);
router.patch("/:id", authenticate, esAdmin, actualizarCategoriaValidator, validarCampos, categoriaPatch);
router.delete("/:id", authenticate, esAdmin, categoriaDelete);

module.exports = router;
