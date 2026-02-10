/**
 * SERVICE DE USUARIOS
 * 
 * Contiene toda la lógica de negocio para usuarios
 * - Validaciones complejas
 * - Operaciones de base de datos
 * - Gestión de perfiles y contraseñas
 * - Validaciones de unicidad (correo, DNI, CUIL)
 * 
 * @module UsuarioService
 */

const Usuario = require("../models/usuario");
const bcryptjs = require("bcryptjs");
const { validarObjectId } = require("../helpers/validarObjectId");

/**
 * Obtener usuarios paginados (solo admin)
 * 
 * @param {Number} limite - Cantidad por página (default: 10, max: 100)
 * @param {Number} desde - Posición inicial (default: 0)
 * @returns {Promise<Object>} { total, usuarios }
 */
const obtenerUsuarios = async (limite = 10, desde = 0) => {
  // Validaciones
  if (isNaN(limite) || isNaN(desde)) {
    throw new Error("Los parámetros 'limite' y 'desde' deben ser números válidos");
  }

  if (limite < 0 || desde < 0) {
    throw new Error("Los parámetros 'limite' y 'desde' deben ser números positivos");
  }

  if (limite > 100) {
    throw new Error("El parámetro 'limite' no puede ser mayor a 100");
  }

  // Queries en paralelo
  const [total, usuarios] = await Promise.all([
    Usuario.countDocuments({ estado: true }),
    Usuario.find({ estado: true })
      .skip(desde)
      .limit(limite),
  ]);

  return { total, usuarios };
};

/**
 * Obtener usuario por ID (solo admin)
 * 
 * @param {String} id - MongoDB ObjectId
 * @returns {Promise<Object>} usuario
 * @throws {Error} Si el ID no es válido o no existe
 */
const obtenerUsuarioPorId = async (id) => {
  // Validar ObjectId
  if (!validarObjectId(id)) {
    throw new Error("El ID de usuario no es válido");
  }

  const usuario = await Usuario.findById(id);

  // Validar existencia y estado activo
  if (!usuario || !usuario.estado) {
    throw new Error("Usuario no encontrado");
  }

  return usuario;
};

/**
 * Actualizar perfil del usuario autenticado
 * 
 * @param {String} usuarioId - ID del usuario autenticado
 * @param {Object} datosActualizar - Campos a actualizar
 * @returns {Promise<Object>} usuario actualizado
 * @throws {Error} Si CUIL duplicado u otros errores
 */
const actualizarPerfil = async (usuarioId, datosActualizar) => {
  const {
    nombreUsuario,
    telefono,
    CUIL,
    domicilioFiscal,
    tipoFacturacion,
    razonSocial,
    img,
  } = datosActualizar;

  const data = {};

  if (nombreUsuario) data.nombreUsuario = nombreUsuario;
  if (telefono) data.telefono = telefono;

  // Validación especial para CUIL (debe ser único)
  if (CUIL) {
    const existeCUIL = await Usuario.findOne({
      CUIL,
      _id: { $ne: usuarioId },
    });
    if (existeCUIL) {
      throw new Error("El CUIL ya está registrado por otro usuario");
    }
    data.CUIL = CUIL;
  }

  if (domicilioFiscal) data.domicilioFiscal = domicilioFiscal;
  if (tipoFacturacion) data.tipoFacturacion = tipoFacturacion;
  if (razonSocial) data.razonSocial = razonSocial;

  // Permitir actualizar imagen (incluido null para eliminarla)
  if (img !== undefined) {
    data.img = img;
  }

  // Actualizar usuario
  const usuario = await Usuario.findByIdAndUpdate(usuarioId, data, { new: true });

  return usuario;
};

/**
 * Actualizar usuario (solo admin)
 * 
 * @param {String} id - MongoDB ObjectId
 * @param {Object} datosActualizar - Campos a actualizar
 * @returns {Promise<Object>} usuario actualizado
 * @throws {Error} Si no existe o datos inválidos
 */
const actualizarUsuario = async (id, datosActualizar) => {
  // Validar ObjectId
  if (!validarObjectId(id)) {
    throw new Error("El ID de usuario no es válido");
  }

  const { contraseña, correo, DNI, ...resto } = datosActualizar;

  // Si se actualiza la contraseña, hashearla
  if (contraseña) {
    const salt = bcryptjs.genSaltSync(10);
    resto.contraseña = bcryptjs.hashSync(contraseña, salt);
  }

  // Actualizar usuario
  const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  return usuario;
};

/**
 * Eliminar usuario (soft delete, solo admin)
 * 
 * @param {String} id - MongoDB ObjectId
 * @returns {Promise<Object>} usuario eliminado
 * @throws {Error} Si no existe
 */
const eliminarUsuario = async (id) => {
  // Validar ObjectId
  if (!validarObjectId(id)) {
    throw new Error("El ID de usuario no es válido");
  }

  // Soft delete
  const usuario = await Usuario.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  return usuario;
};

/**
 * Cambiar contraseña del usuario autenticado
 * 
 * @param {Object} usuario - Usuario autenticado completo
 * @param {String} contraseñaActual - Contraseña actual para verificar
 * @param {String} contraseñaNueva - Nueva contraseña
 * @returns {Promise<void>}
 * @throws {Error} Si contraseña actual incorrecta o nueva igual a actual
 */
const cambiarContrasena = async (usuario, contraseñaActual, contraseñaNueva) => {
  // Verificar que la contraseña actual sea correcta
  const validPassword = bcryptjs.compareSync(contraseñaActual, usuario.contraseña);

  if (!validPassword) {
    throw new Error("La contraseña actual es incorrecta");
  }

  // Validar que la nueva contraseña sea diferente
  const mismaContraseña = bcryptjs.compareSync(contraseñaNueva, usuario.contraseña);

  if (mismaContraseña) {
    throw new Error("La nueva contraseña debe ser diferente a la actual");
  }

  // Hashear la nueva contraseña
  const salt = bcryptjs.genSaltSync(10);
  const contraseñaHash = bcryptjs.hashSync(contraseñaNueva, salt);

  // Actualizar en base de datos
  await Usuario.findByIdAndUpdate(usuario._id, {
    contraseña: contraseñaHash,
  });
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarPerfil,
  actualizarUsuario,
  eliminarUsuario,
  cambiarContrasena,
};
