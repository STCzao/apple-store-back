const { response, request } = require("express");
const { Producto, Categoria } = require("./../models/index");
const mongoose = require("mongoose");

//Definir las colecciones permitidas para buscar
const coleccionesPermitidas = ["categorias", "productos"];

//Buscar productos por categoría
const buscarCategorias = async (termino, res = response) => {
  const regex = new RegExp(termino, "i");

  const categorias = await Categoria.find({
    $or: [{ nombreCategoria: regex }],
    $and: [{ estado: true }],
  });

  res.json({
    msg: "Categorías encontradas",
    results: categorias,
  });
};

// Buscar productos por nombre
const buscarProductos = async (termino, res = response) => {
  const regex = new RegExp(termino, "i");

  // Buscar categorías que coincidan con el término
  const categorias = await Categoria.find({
    nombreCategoria: regex,
    estado: true,
  });

  const categoriaIds = categorias.map((cat) => cat._id);

  //Buscar productos por nombre, marca o categoría
  const productos = await Producto.find({
    $or: [
      { nombreProducto: regex },
      { marca: regex },
      { categoria: { $in: categoriaIds } },
    ],
    $and: [{ estado: true }],
  }).populate("categoria", "nombreCategoria");

  res.json({
    msg: "Productos encontrados",
    results: productos,
  });
};

//Función principal de búsqueda
const buscar = (req = request, res = response) => {
  const { coleccion, termino } = req.params;
  if (!coleccionesPermitidas.includes(coleccion)) {
    return res.status(400).json({
      msg: `Las colecciones permitidas son: ${coleccionesPermitidas}`,
    });
  }

  //En funcion de la coleccion, buscar los terminos
  switch (coleccion) {
    case "categorias":
      buscarCategorias(termino, res);
      break;
    case "productos":
      buscarProductos(termino, res);
      break;
    default:
      res.status(500).json({
        msg: "Hubo un error al hacer la búsqueda",
      });
      break;
  }
};
module.exports = {
  buscar,
};
