const { Router } = require("express");
const authenticate = require("../middlewares/authenticate");
const { esAdmin } = require("../middlewares/authorize");
const validarCampos = require("../middlewares/validarCampos");
const { actualizarPerfilValidator, actualizarUsuarioValidator, cambiarContrasenaValidator } = require("../validators/usuario.validator");
const { usuariosGet, perfilGet, perfilPatch, usuarioGet, usuarioPatch, usuarioDelete, cambiarContrasena } = require("../controllers/usuario.controller");

const router = Router();

router.get("/", authenticate, esAdmin, usuariosGet);
router.get("/perfil", authenticate, perfilGet);
router.patch("/perfil", authenticate, actualizarPerfilValidator, validarCampos, perfilPatch);
router.post("/cambiar-contrasena", authenticate, cambiarContrasenaValidator, validarCampos, cambiarContrasena);

router.get("/:id", authenticate, esAdmin, usuarioGet);
router.patch("/:id", authenticate, esAdmin, actualizarUsuarioValidator, validarCampos, usuarioPatch);
router.delete("/:id", authenticate, esAdmin, usuarioDelete);

module.exports = router;
