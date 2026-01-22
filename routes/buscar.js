/**
 * RUTAS DE BÚSQUEDA
 * 
 * Define el endpoint para buscar productos y categorías
 * Soporta búsqueda por nombre, marca y categoría
 * 
 * @module BuscarRoutes
 */

const { Router } = require("express");
const { buscar } = require("../controllers/buscar");

const router = Router();

/**
 * @route GET /api/buscar/:coleccion/:termino
 * @access Public
 * @description Buscar productos o categorías por término
 * 
 * @param {String} coleccion - Tipo de búsqueda: "productos" o "categorias"
 * @param {String} termino - Término a buscar
 * 
 * @returns {Object} { msg, results[] }
 * 
 * Campos que busca según colección:
 * - productos: nombreProducto, marca, categoría (por nombre)
 * - categorias: nombreCategoria
 * 
 * Búsqueda:
 * - Case-insensitive (mayúsculas/minúsculas)
 * - Parcial (busca coincidencias dentro del texto)
 * - Solo activos (estado: true)
 * 
 * @example
 * GET /api/buscar/productos/iPhone
 * Busca productos con "iPhone" en nombre, marca o categoría
 * 
 * GET /api/buscar/categorias/electrónica
 * Busca categorías con "electrónica" en el nombre
 * 
 * Respuesta exitosa (200):
 * {
 *   "msg": "Productos encontrados",
 *   "results": [
 *     {
 *       "_id": "...",
 *       "nombreProducto": "IPHONE 15",
 *       "marca": "APPLE",
 *       "precio": 999,
 *       "categoria": { "_id": "...", "nombreCategoria": "Celulares" }
 *     }
 *   ]
 * }
 */
router.get("/:coleccion/:termino", buscar);

module.exports = router;
