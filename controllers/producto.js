const { response, request } = require("express");
const Producto = require("../models/producto");

// Función para normalizar texto (convertir a mayusculas)

const escapeRegex = (texto) => {
  if (typeof texto !== "string") return "";
  return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
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

    const pageNum = Math.max(1, parseInt(desde, 10) || 1);
    const limitNum = Math.max(1, parseInt(limite, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const query = { activo: true };

    if (categoria) {
      query.categoria = categoria;
    }

    if (marca) {
      query.marca = new RegExp("^" + escapeRegex(marca), "i");
    }

    if (nombreProducto) {
      query.nombreProducto = new RegExp(escapeRegex(nombreProducto), "i");
    }

    if (search) {
      const s = escapeRegex(search); 
      const searchRegex = new RegExp(s, "i");
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
        .populate("creadoPor", "nombreUsuario correo"),
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
