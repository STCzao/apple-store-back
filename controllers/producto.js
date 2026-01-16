const { response, request } = require("express");
const Producto = require("../models/producto");

// Función para normalizar texto (convertir a mayusculas)

const normalizarTexto = (texto) => {
  if (typeof texto !== "string") return "";
  return texto.trim().toUpperCase();
};

// Obtener productos con paginacion

const ObtenerProductos = async (req = request, res = response) => {
  try {
    const {
      limite = 12,
      desde = 1,
      categoria,
      marca,
      nombreProducto,
      search,
    } = req.query;

    const pageNum = Number(desde);
    const limitNum = Number(limite);
    const skip = (pageNum - 1) * limitNum;

    const query = { activo: true };

    if (categoria) {
      query.categoria = categoria;
    }

    if (marca) {
      query.marca = normalizarTexto(marca);
    }

    if (nombreProducto) {
      query.nombreProducto = normalizarTexto(nombreProducto);
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { nombreProducto: searchRegex },
        { marca: searchRegex },
        { descripcion: searchRegex },
      ];
    }

    const [total, productos] = await Promise.all([
      Producto.countDocuments(query),
      Producto.find(query)
        .skip(skip)
        .limit(limitNum)
        .populate("categoria", "nombreCategoria")
        .populate("creadoPor", "nombreUsuario email"),
    ]);

    res.json({
      success: true,
      productos,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
    });
  }
};
