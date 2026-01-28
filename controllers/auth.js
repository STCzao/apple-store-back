/**
 * CONTROLADOR DE AUTENTICACIÓN
 *
 * Maneja registro, login y renovación de token
 * Refactorizado para usar capa de servicios
 *
 * @module AuthController
 */

const { response } = require("express");
const authService = require("../services/auth");

/**
 * POST /api/auth/registro
 *
 * Registra un nuevo usuario en el sistema
 *
 * @async
 * @param {Object} req - Request
 * @param {Object} req.body - Datos del nuevo usuario
 * @param {Object} res - Response
 *
 * @returns {Object} { usuario, token }
 */
const register = async (req, res = response) => {
  try {
    const { usuario, token } = await authService.registrarUsuario(req.body);

    res.status(201).json({ usuario, token });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

/**
 * POST /api/auth/login
 *
 * Inicia sesión de un usuario existente
 *
 * @async
 * @param {Object} req - Request
 * @param {Object} req.body.correo - Email del usuario
 * @param {Object} req.body.contraseña - Contraseña sin encriptar
 * @param {Object} res - Response
 *
 * @returns {Object} { usuario, token }
 */
const login = async (req, res = response) => {
  try {
    const { correo, contraseña } = req.body;
    const { usuario, token } = await authService.iniciarSesion(correo, contraseña);

    res.json({ usuario, token });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

/**
 * GET /api/auth/renovar
 *
 * Renueva el token JWT sin necesidad de login
 *
 * @async
 * @param {Object} req - Request
 * @param {Object} req.usuario - Usuario autenticado (del middleware)
 * @param {Object} res - Response
 *
 * @returns {Object} { usuario, token }
 */
const renovarToken = async (req, res = response) => {
  try {
    const { usuario } = req;
    const { usuario: usuarioActualizado, token } = await authService.renovarToken(usuario.id);

    res.json({ usuario: usuarioActualizado, token });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  register,
  login,
  renovarToken,
};
