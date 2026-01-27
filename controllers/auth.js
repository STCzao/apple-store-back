/**
 * CONTROLADOR DE AUTENTICACIÓN
 *
 * Maneja registro, login y renovación de token
 *
 * @module AuthController
 */

const { response } = require("express");
const Usuario = require("../models/usuario");
const bcryptjs = require("bcryptjs");
const { generarJWT } = require("../helpers/generarJWT");

/**
 * POST /api/auth/registro
 *
 * Registra un nuevo usuario en el sistema
 * - Hashea la contraseña con bcrypt
 * - Asigna rol USER_ROLE por defecto
 * - Genera token JWT automáticamente
 *
 * @async
 * @param {Object} req - Request
 * @param {Object} req.body - Datos del nuevo usuario
 * @param {Object} res - Response
 *
 * @returns {Object} { usuario, token }
 */

const register = async (req, res = response) => {
  const { nombreUsuario, correo, contraseña, telefono, DNI, CUIL, domicilioFiscal } = req.body;

  try {
    //Verificar si el correo ya existe
    const existeCorreo = await Usuario.findOne({ correo });
    if (existeCorreo) {
      return res.status(400).json({
        msg: "El correo ya está registrado",
      });
    }

    //Verificar si el DNI ya existe
    const existeDNI = await Usuario.findOne({ DNI });
    if (existeDNI) {
      return res.status(400).json({
        msg: "El DNI ya está registrado",
      });
    }

    //Verificar si el CUIL ya existe
    const existeCUIL = await Usuario.findOne({ CUIL });
    if (existeCUIL) {
      return res.status(400).json({
        msg: "El CUIL ya está registrado",
      });
    }

    //Crear instancia del usuario
    const usuario = new Usuario({
      nombreUsuario,
      correo,
      contraseña,
      telefono,
      DNI,
      CUIL,
      domicilioFiscal,
      rol: "USER_ROLE",
    });

    //Hashear la contraseña
    const salt = bcryptjs.genSaltSync(10);
    usuario.contraseña = bcryptjs.hashSync(contraseña, salt);

    //Guardar en base de datos
    await usuario.save();

    //Generar JWT
    const token = await generarJWT(usuario.id);
    res.status(201).json({
      usuario,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al registrar usuario. Hable con el administrador.",
    });
  }
};

/**
 * POST /api/auth/login
 *
 * Inicia sesión de un usuario existente
 * - Verifica correo y contraseña
 * - Valida que el usuario esté activo
 * - Genera nuevo token JWT
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
  const { correo, contraseña } = req.body;
  try {
    //Verificar si el correo existe
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({
        msg: "Correo o contraseña incorrectos",
      });
    }

    //Verificar si el usuario esta activo
    if (!usuario.estado) {
      return res.status(400).json({
        msg: "Usuario inhabilitado. Contacte al administrador.",
      });
    }

    //Verificar la contraseña
    const validPassword = bcryptjs.compareSync(contraseña, usuario.contraseña);
    if (!validPassword) {
      return res.status(400).json({
        msg: "Correo o contraseña incorrectos",
      });
    }

    //Generar JWT
    const token = await generarJWT(usuario.id);

    res.json({
      usuario,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al iniciar sesión. Hable con el administrador.",
    });
  }
};

/**
 * GET /api/auth/renovar
 *
 * Renueva el token JWT sin necesidad de login
 * - Requiere token válido en headers
 * - Usuario ya viene del middleware validarJWT
 * - Genera nuevo token con tiempo extendido
 *
 * @async
 * @param {Object} req - Request
 * @param {Object} req.usuario - Usuario autenticado (del middleware)
 * @param {Object} res - Response
 *
 * @returns {Object} { usuario, token }
 */

const renovarToken = async (req, res = response) => {
  const { usuario } = req;

  try {
    //Generar nuevo JWT
    const token = await generarJWT(usuario.id);

    res.json({
      usuario,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al renovar token. Hable con el administrador.",
    });
  }
};

module.exports = {
  register,
  login,
  renovarToken,
};
