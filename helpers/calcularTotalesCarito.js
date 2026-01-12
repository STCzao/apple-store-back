const e = require("cors");

const calcularTotalesCarrito = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      items: [],
      subtotal: 0,
      total: 0,
    };
  }

  // Calculamos el subtotal por item y el subtotal general
  let subtotalGeneral = 0;

  const itemsCalculados = items.map((item) => {
    const subtotalItem = item.precioSnapshot * item.cantidad;
    subtotalGeneral += subtotalItem;

    return {
      ...item,
      subtotal: subtotalItem,
    };
  });

  // Aplicamos descuentos si existen
  let montoDescuento = 0;

  switch (descuento?.tipo) {
    case "PORCENTAJE":
      montoDescuento = subtotalGeneral * (descuento.valor / 100);
      break;
    case "FIJO":
      montoDescuento = descuento.valor;
      break;
    default:
      break;
  }

  // Calculamos el total asegurandonos que el descuento no exceda el subtotal
  montoDescuento = Math.min(montoDescuento, subtotalGeneral);

  //Retornamos el total calculado con descuento aplicado
  const subtotalConDescuento = subtotalGeneral - montoDescuento;

  //Calculamos impuestos si es necesario (aqui asumimos un 0% de impuestos para simplificar)
  let montoImpuestos = 0;

  if (impuestos?.aplicaIVA) {
    montoImpuestos = subtotalConDescuento * 0.21; // Asumiendo un 21% de IVA
  }

  // Calculamos envio si es necesario
  let montoEnvio = 0;

  if (envio?.costo) {
    montoEnvio = envio.costo;
  }

  //Total final
  const totalFinal = subtotalConDescuento + montoImpuestos + montoEnvio;

  return {
    items: itemsCalculados,
    subtotal: subtotalGeneral,
    montoDescuento: montoDescuento,
    montoImpuestos: montoImpuestos,
    montoEnvio: montoEnvio,
    total: totalFinal,
  };
};

module.exports = {
  calcularTotalesCarrito,
};
