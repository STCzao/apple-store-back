/**
 * HELPER: Validar Stock de Producto
 * 
 * Verifica que un producto tenga suficiente stock disponible
 * antes de agregarlo al carrito o crear una orden
 * 
 * @param {Object} producto - Documento del producto desde MongoDB
 * @param {Number} cantidadSolicitada - Cantidad que el usuario quiere comprar
 * 
 * @throws {Error} Si el producto no existe, está inactivo o no hay suficiente inventario
 * 
 * @returns {boolean} true si la validación pasa
 * 
 * Notas:
 * - Usa "estado" (no "activo") según el modelo Producto
 * - Usa "inventario" (no "stock") según el modelo Producto
 * - Lanza errores descriptivos para manejar en el controller
 */
const validarStock = (producto, cantidadSolicitada) => {
  // Validar que el producto existe
  if (!producto) {
    throw new Error("El producto no existe.");
  }

  // Validar que el producto está activo (estado = true)
  if (!producto.estado) {
    throw new Error("El producto no está disponible.");
  }

  // Validar que la cantidad solicitada sea válida
  if (!cantidadSolicitada || cantidadSolicitada <= 0) {
    throw new Error("La cantidad solicitada debe ser mayor a 0.");
  }

  // Validar que haya suficiente inventario
  if (producto.inventario < cantidadSolicitada) {
    throw new Error(
      `Stock insuficiente. Disponible: ${producto.inventario}, Solicitado: ${cantidadSolicitada}`
    );
  }

  // Si todo está bien, retornar true
  return true;
};

module.exports = { validarStock };
