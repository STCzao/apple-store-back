/**
 * HELPER: Calcular Totales del Carrito
 *
 * Calcula los subtotales de cada item y el total general del carrito
 *
 * @param {Array} items - Array de items del carrito
 * @param {Object} items[].precioSnapshot - Precio del producto al momento de agregarlo
 * @param {Number} items[].cantidad - Cantidad de unidades
 *
 * @returns {Object} Objeto con items calculados, subtotal y total
 *
 * Notas:
 * - Usa precioSnapshot para mantener precios históricos
 * - Valida que los items sean válidos antes de calcular
 * - Redondea a 2 decimales para evitar problemas de precisión
 */

const calcularTotalesCarrito = (items = []) => {
  // Validar que items sea un arreglo
  if (!Array.isArray(items)) {
    throw new Error("El parámetro items debe ser un arreglo.");
  }

  // Si el carrito está vacío, retornamos totales en cero
  if (items.length === 0) {
    return {
      items: [],
      subtotal: 0,
      total: 0,
    };
  }

  // Calculamos el subtotal por item y el subtotal general
  let subtotalGeneral = 0;

  const itemsCalculados = items.map((item) => {
    // Validar que el item tenga los campos necesarios
    if (!item.precioSnapshot || !item.cantidad) {
      throw new Error("Cada item debe tener precioSnapshot y cantidad");
    }

    // Validar que los valores sean números positivos
    if (item.precioSnapshot < 0 || item.cantidad <= 0) {
      throw new Error("El precio y la cantidad deben ser valores positivos");
    }

    // Calcular subtotal del item (precio × cantidad)
    const subtotalItem = item.precioSnapshot * item.cantidad;

    // Acumular al subtotal general
    subtotalGeneral += subtotalItem;

    // Retornar el item con su subtotal calculado
    return {
      ...item,
      subtotal: Number(subtotalItem.toFixed(2)), // Redondear a 2 decimales
    };
  });

  // Redondear subtotal a 2 decimales para evitar problemas de precisión
  subtotalGeneral = Number(subtotalGeneral.toFixed(2));

  // Por ahora, total = subtotal
  // En el futuro puedes agregar: descuentos, impuestos, envío
  const total = subtotalGeneral;

  return {
    items: itemsCalculados,
    subtotal: subtotalGeneral,
    total,
  };
};

module.exports = {
  calcularTotalesCarrito,
};
