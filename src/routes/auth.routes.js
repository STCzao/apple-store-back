const { Router } = require("express");
const authenticate = require("../middlewares/authenticate");
const validarCampos = require("../middlewares/validarCampos");
const { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator, reenviarVerificacionValidator } = require("../validators/auth.validator");
const { register, login, refresh, logout, confirmarEmail, reenviarVerificacion, forgotPassword, resetPassword } = require("../controllers/auth.controller");

const router = Router();

router.post("/registro", registerValidator, validarCampos, register);
router.post("/login", loginValidator, validarCampos, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/confirmar/:token", confirmarEmail);
router.post("/reenviar-verificacion", reenviarVerificacionValidator, validarCampos, reenviarVerificacion);
router.post("/forgot-password", forgotPasswordValidator, validarCampos, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidator, validarCampos, resetPassword);

module.exports = router;
