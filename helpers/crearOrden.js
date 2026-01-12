const Carrito = require("../models/Carrito");
const Orden = require("../models/Orden");
const { validarStock } = require("./validarStock");

const crearOrden = async ({ carritoId, usuarioId }) => {
  const carrito = await Carrito.findById(carritoId).populate(
    "productos.producto"
  );

  if (!carrito) {
    throw new Error("Carrito no encontrado");
  }

  if (carrito.estado !== "ACTIVO") {
    throw new Error("El carrito no está activo");
  }

  if (!carrito.producto || carrito.productos.length === 0) {
    throw new Error("El carrito está vacío");
  }

  //Validar stock antes de crear la orden
 validarStock(carrito.productos);

  const orden = await Orden.create({
    usuarioId,
    carritoId: carrito._id,
    productos: carrito.productos.map((producto) => ({
      productoId: producto.producto._id,
      nombreSnapshot: producto.nombreSnapshot,
      precioSnapshot: producto.precioSnapshot,
      cantidad: producto.cantidad,
      subtotal: producto.subtotal,
    })),
    moneda: carrito.moneda,
    subtotal: carrito.subtotal,
    total: carrito.total,
  });

  carrito.estado = "CHEQUEANDO";
  await carrito.save();

  return orden;
};

module.exports = { crearOrden };
