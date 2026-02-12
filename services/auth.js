/**
 * SERVICE DE AUTENTICACIÓN
 *
 * Contiene toda la lógica de negocio para autenticación
 * - Registro de nuevos usuarios
 * - Login y verificación de credenciales
 * - Generación y renovación de tokens JWT
 * - Validaciones de unicidad (correo, DNI, CUIL)
 *
 * @module AuthService
 */

const Usuario = require("../models/usuario");
const bcryptjs = require("bcryptjs");
const { generarJWT } = require("../helpers/generarJWT");

/**
 * Registrar nuevo usuario
 *
 * @param {Object} datosUsuario - Datos del nuevo usuario
 * @param {String} datosUsuario.nombreUsuario - Nombre completo
 * @param {String} datosUsuario.correo - Email único
 * @param {String} datosUsuario.contraseña - Contraseña sin encriptar
 * @param {String} datosUsuario.telefono - Teléfono
 * @param {String} datosUsuario.DNI - DNI único
 * @param {String} datosUsuario.CUIL - CUIL único
 * @param {Object} datosUsuario.domicilioFiscal - Domicilio fiscal
 * @returns {Promise<Object>} { usuario, token }
 * @throws {Error} Si correo, DNI o CUIL ya existen
 */
const registrarUsuario = async (datosUsuario) => {
  const {
    nombreUsuario,
    correo,
    contraseña,
    telefono,
    DNI,
    CUIL,
    domicilioFiscal,
  } = datosUsuario;

  // Verificar si el correo ya existe
  const existeCorreo = await Usuario.findOne({ correo });
  if (existeCorreo) {
    throw new Error("El correo ya está registrado");
  }

  // Verificar si el DNI ya existe
  const existeDNI = await Usuario.findOne({ DNI });
  if (existeDNI) {
    throw new Error("El DNI ya está registrado");
  }

  // Verificar si el CUIL ya existe
  const existeCUIL = await Usuario.findOne({ CUIL });
  if (existeCUIL) {
    throw new Error("El CUIL ya está registrado");
  }

  // Crear instancia del usuario
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

  // Hashear la contraseña
  const salt = bcryptjs.genSaltSync(10);
  usuario.contraseña = bcryptjs.hashSync(contraseña, salt);

  // Guardar en base de datos
  await usuario.save();

  // Generar JWT
  const token = await generarJWT(usuario.id);

  return { usuario, token };
};

/**
 * Iniciar sesión
 *
 * @param {String} correo - Email del usuario
 * @param {String} contraseña - Contraseña sin encriptar
 * @returns {Promise<Object>} { usuario, token }
 * @throws {Error} Si credenciales inválidas o usuario inactivo
 */
const iniciarSesion = async (correo, contraseña) => {
  // Verificar si el correo existe
  const usuario = await Usuario.findOne({ correo });
  if (!usuario) {
    throw new Error("Correo o contraseña incorrectos");
  }

  // Verificar si el usuario está activo
  if (!usuario.estado) {
    throw new Error("Usuario inhabilitado. Contacte al administrador.");
  }

  // Verificar la contraseña
  const validPassword = bcryptjs.compareSync(contraseña, usuario.contraseña);
  if (!validPassword) {
    throw new Error("Correo o contraseña incorrectos");
  }

  // Generar JWT
  const token = await generarJWT(usuario.id);

  return { usuario, token };
};

/**
 * Renovar token JWT
 *
 * @param {String} usuarioId - ID del usuario autenticado
 * @returns {Promise<Object>} { usuario, token }
 * @throws {Error} Si error al generar token
 */
const renovarToken = async (usuarioId) => {
  // Usuario ya viene validado del middleware validarJWT
  const usuario = await Usuario.findById(usuarioId);

  // Generar nuevo JWT
  const token = await generarJWT(usuario.id);

  return { usuario, token };
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  renovarToken,
};
