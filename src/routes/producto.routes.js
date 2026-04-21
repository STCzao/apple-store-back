const { Router } = require("express");
const authenticate = require("../middlewares/authenticate");
const { esAdmin } = require("../middlewares/authorize");
const validarCampos = require("../middlewares/validarCampos");
const { crearProductoValidator, actualizarProductoValidator } = require("../validators/producto.validator");
const { productosGet, productoGet, productoPost, productoPatch, productoDelete } = require("../controllers/producto.controller");

const router = Router();

router.get("/", productosGet);
router.get("/:id", productoGet);
router.post("/", authenticate, esAdmin, crearProductoValidator, validarCampos, productoPost);
router.patch("/:id", authenticate, esAdmin, actualizarProductoValidator, validarCampos, productoPatch);
router.delete("/:id", authenticate, esAdmin, productoDelete);

module.exports = router;
