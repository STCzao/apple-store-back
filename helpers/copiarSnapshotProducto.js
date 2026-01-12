const copiarSnapshotProducto = (producto) => {
  if (!producto) {
    throw new Error("Producto inválido para snapshot");
  }

  return {
    nombreSnapshot: producto.nombreProducto,
    precioSnapshot: producto.precio,
  };
};

module.exports = { copiarSnapshotProducto };
