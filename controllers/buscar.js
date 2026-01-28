/**
 * CONTROLADOR DE BÚSQUEDA
 *
 * Maneja operaciones de búsqueda de productos y categorías
 * Refactorizado con arquitectura de services
 *
 * @module BuscarController
 */

const { response, request } = require("express");
const buscarService = require("../services/buscar");

// Definir las colecciones permitidas para buscar
const coleccionesPermitidas = ["categorias", "productos"];

/**
 * GET /api/buscar/:coleccion/:termino
 *
 * Buscar en colección específica por término
 *
 * @param {String} coleccion - Colección donde buscar (categorias/productos)
 * @param {String} termino - Término de búsqueda
 */
const buscar = async (req = request, res = response) => {
  try {
    const { coleccion, termino } = req.params;

    // Validar colección permitida
    if (!coleccionesPermitidas.includes(coleccion)) {
      return res.status(400).json({
        msg: `Las colecciones permitidas son: ${coleccionesPermitidas}`,
      });
    }

    // Buscar según la colección
    let results;
    let msg;

    switch (coleccion) {
      case "categorias":
        results = await buscarService.buscarCategorias(termino);
        msg = "Categorías encontradas";
        break;

      case "productos":
        results = await buscarService.buscarProductos(termino);
        msg = "Productos encontrados";
        break;

      default:
        return res.status(500).json({
          msg: "Hubo un error al hacer la búsqueda",
        });
    }

    res.json({
      msg,
      results,
    });
  } catch (error) {
    const statusCode = error.message.includes("vacío") ? 400 : 500;
    res.status(statusCode).json({ msg: error.message });
  }
};

module.exports = {
  buscar,
};

