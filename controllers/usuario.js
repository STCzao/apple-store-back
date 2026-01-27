/**
 * CONTROLADOR DE USUARIOS
 *
 * Maneja operaciones CRUD de usuarios
 *
 * @module UsuarioController
 */

const { response } = require("express");
const Usuario = require("../models/usuario");
const bcryptjs = require("bcryptjs");
const { validObjectId } = require("../helpers/validObjectId");
const usuario = require("../models/usuario");

/**
 * GET /api/usuario
 *
 * Obtener lista paginada de usuarios (solo admin)
 */

const usuariosGet = async (req, res = response) => {
  const { limite = 10, desde = 0 } = req.query;

  try {
    //Validar parametros
    const limitNum = parseInt(limite);
    const desdeNum = parseInt(desde);

    if (isNaN(limitNum) || isNaN(desdeNum) || limitNum < 0 || desdeNum < 0) {
      return res.status(400).json({
        msg: "Los parámetros 'limite' y 'desde' deben ser números positivos",
      });
    }

    if (limitNum > 100) {
      return res.status(400).json({
        msg: "El parámetro 'limite' no puede ser mayor a 100",
      });
    }

    //Obtener total y usuarios en paralelo
    const [total, usuarios] = await Promise.all([
      Usuario.countDocuments({ estado: true }),
      Usuario.find({ estado: true }).skip(desdeNum).limit(limitNum),
    ]);
    res.json({
      total,
      usuarios,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al obtener usuarios. Hable con el administrador.",
    });
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
 *
 * Permite modificar:
 * - Datos personales (nombreUsuario, telefono, img)
 * - Datos fiscales (CUIL, domicilioFiscal, tipoFacturacion, razonSocial)
 *
 * Campos bloqueados (validados en routes):
 * - correo, DNI, contraseña, rol, estado
 */

const perfilPut = async (req, res = response) => {
  const { usuario } = req;
  const {
    nombreUsuario,
    telefono,
    CUIL,
    domicilioFiscal,
    tipoFacturacion,
    razonSocial,
    img,
  } = req.body;

  try {
    //Preparar datos a actualizar
    const datosActualizar = {};

    if (nombreUsuario) datosActualizar.nombreUsuario = nombreUsuario;
    if (telefono) datosActualizar.telefono = telefono;

    // Validación especial para CUIL (debe ser único)
    if (CUIL) {
      const existeCUIL = await Usuario.findOne({
        CUIL,
        _id: { $ne: usuario.id },
      });
      if (existeCUIL) {
        return res.status(400).json({
          msg: "El CUIL ya está registrado por otro usuario",
        });
      }
      datosActualizar.CUIL = CUIL;
    }

    if (domicilioFiscal) datosActualizar.domicilioFiscal = domicilioFiscal;
    if (tipoFacturacion) datosActualizar.tipoFacturacion = tipoFacturacion;
    if (razonSocial) datosActualizar.razonSocial = razonSocial;

    // Permitir actualizar imagen (incluido null para eliminarla)
    if (img !== undefined) {
      datosActualizar.img = img;
    }

    //Actualizar usuario
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuario._id,
      datosActualizar,
      { new: true },
    );

    res.json({
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al actualizar perfil. Hable con el administrador.",
    });
  }
};

/**
 * GET /api/usuario/:id
 *
 * Obtener usuario específico (solo admin)
 */

const usuarioGet = async (req, res = response) => {
  const { id } = req.params;

  try {
    //Validar ObjectId
    if (!validObjectId(id)) {
      return res.status(400).json({
        msg: "El ID de usuario no es válido",
      });
    }

    //Buscar usuario
    const usuario = await Usuario.findById(id);

    if (!usuario || !usuario.estado) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    res.json({
      usuario,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al obtener usuario. Hable con el administrador.",
    });
  }
};

/**
 * PUT /api/usuario/:id
 *
 * Actualizar usuario (solo admin)
 */

const usuarioPut = async (req, res = response) => {
  const { id } = req.params;
  const { contraseña, correo, DNI, ...resto } = req.body;

  try {
    //Validar ObjectId
    if (!validObjectId(id)) {
      return res.status(400).json({
        msg: "El ID de usuario no es válido",
      });
    }

    //Si se actualiza la contraseña, hashearla
    if (contraseña) {
      const salt = bcryptjs.genSaltSync(10);
      resto.contraseña = bcryptjs.hashSync(contraseña, salt);
    }

    //Actualizar usuario
    const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true });

    if (!usuario) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    res.json({
      usuario,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al actualizar usuario. Hable con el administrador.",
    });
  }
};

/**
 * DELETE /api/usuario/:id
 *
 * Soft delete de usuario (solo admin)
 */

const usuarioDelete = async (req, res = response) => {
  const { id } = req.params;

  try {
    //Validar ObjectId
    if (!validObjectId(id)) {
      return res.status(400).json({
        msg: "El ID de usuario no es válido",
      });
    }

    //Soft delete (cambiar estado a false)
    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );

    if (!usuario) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    res.json({
      usuario,
      msg: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al eliminar usuario. Hable con el administrador.",
    });
  }
};

/**
 * POST /api/usuario/cambiar-contrasena
 *
 * Permite al usuario cambiar su propia contraseña
 *
 * Requiere:
 * - Contraseña actual (verificación de seguridad)
 * - Nueva contraseña (mínimo 6 caracteres)
 */

const cambiarContrasena = async (req, res = response) => {
  const { usuario } = req;
  const { contraseñaActual, contraseñaNueva } = req.body;

  try {
    // 1. Verificar que la contraseña actual sea correcta
    const validPassword = bcryptjs.compareSync(
      contraseñaActual,
      usuario.contraseña
    );

    if (!validPassword) {
      return res.status(401).json({
        msg: "La contraseña actual es incorrecta",
      });
    }

    // 2. Validar que la nueva contraseña sea diferente
    const mismaContraseña = bcryptjs.compareSync(
      contraseñaNueva,
      usuario.contraseña
    );

    if (mismaContraseña) {
      return res.status(400).json({
        msg: "La nueva contraseña debe ser diferente a la actual",
      });
    }

    // 3. Hashear la nueva contraseña
    const salt = bcryptjs.genSaltSync(10);
    const contraseñaHash = bcryptjs.hashSync(contraseñaNueva, salt);

    // 4. Actualizar en base de datos
    await Usuario.findByIdAndUpdate(usuario._id, {
      contraseña: contraseñaHash,
    });

    res.json({
      msg: "Contraseña actualizada correctamente. Por seguridad, inicia sesión nuevamente.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al cambiar contraseña. Hable con el administrador.",
    });
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