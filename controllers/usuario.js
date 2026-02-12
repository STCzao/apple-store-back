/**
 * CONTROLADOR DE USUARIOS
 *
 * Maneja operaciones CRUD de usuarios
 * Refactorizado para usar capa de servicios
 *
 * @module UsuarioController
 */

const { response } = require("express");
const usuarioService = require("../services/usuario");

/**
 * GET /api/usuario
 *
 * Obtener lista paginada de usuarios (solo admin)
 */
const usuariosGet = async (req, res = response) => {
  try {
    const { limite = 10, desde = 0 } = req.query;

    const { total, usuarios } = await usuarioService.obtenerUsuarios(
      Number(limite),
      Number(desde)
    );

    res.json({ total, usuarios });
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * GET /api/usuario/perfil
 *
 * Obtener perfil del usuario autenticado
 */

const perfilGet = async (req, res = response) => {
  const { usuario } = req;

  res.json({
    usuario,
  });
};

/**
 * PUT /api/usuario/perfil
 *
 * Actualizar perfil del usuario autenticado
 */
const perfilPut = async (req, res = response) => {
  try {
    const { usuario } = req;
    const usuarioActualizado = await usuarioService.actualizarPerfil(
      usuario._id,
      req.body
    );

    res.json({ usuario: usuarioActualizado });
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * GET /api/usuario/:id
 *
 * Obtener usuario específico (solo admin)
 */
const usuarioGet = async (req, res = response) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.obtenerUsuarioPorId(id);

    res.json({ usuario });
  } catch (error) {
    const statusCode = error.message.includes("no es válido") ? 400 : 404;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * PUT /api/usuario/:id
 *
 * Actualizar usuario (solo admin)
 */
const usuarioPut = async (req, res = response) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.actualizarUsuario(id, req.body);

    res.json({ usuario });
  } catch (error) {
    const statusCode = error.message.includes("no encontrado") ? 404 : 400;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * DELETE /api/usuario/:id
 *
 * Soft delete de usuario (solo admin)
 */
const usuarioDelete = async (req, res = response) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.eliminarUsuario(id);

    res.json({
      usuario,
      errors: [{ msg: "Usuario eliminado correctamente" }],
    });
  } catch (error) {
    const statusCode = error.message.includes("no encontrado") ? 404 : 400;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

/**
 * POST /api/usuario/cambiar-contrasena
 *
 * Permite al usuario cambiar su propia contraseña
 */
const cambiarContrasena = async (req, res = response) => {
  try {
    const { usuario } = req;
    const { contraseñaActual, contraseñaNueva } = req.body;

    await usuarioService.cambiarContrasena(usuario, contraseñaActual, contraseñaNueva);

    res.json({
      errors: [{ msg: "Contraseña actualizada correctamente. Por seguridad, inicia sesión nuevamente." }],
    });
  } catch (error) {
    const statusCode = error.message.includes("incorrecta") ? 401 : 400;
    res.status(statusCode).json({ errors: [{ msg: error.message }] });
  }
};

module.exports = {
  usuariosGet,
  perfilGet,
  perfilPut,
  usuarioGet,
  usuarioPut,
  usuarioDelete,
  cambiarContrasena,
};