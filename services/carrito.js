/**
 * SERVICE DE CARRITO
 *
 * Lógica de negocio del carrito de compras
 * - Gestión de items (agregar, actualizar cantidad, eliminar)
 * - Cálculo de totales con snapshots de precios
 * - Máquina de estados del carrito
 * - Validación de stock en tiempo real
 *
 * @module CarritoService
 */

const { Carrito, Producto } = require("../models/index");
const { calcularTotalesCarrito } = require("../helpers/calcularTotalesCarrito");
const { validObjectId } = require("../helpers/validObjectId");
const { copiarSnapshotProducto } = require("../helpers/copiarSnapshotProducto");

/**
 * Obtener o crear carrito activo del usuario
 *
 * @param {String} usuarioId - ID del usuario (opcional para guest)
 * @returns {Promise<Object>} carrito activo
 */

const obtenerCarritoActivo = async (usuarioId = null) => {
  //Buscar carrito activo existente
  let carrito = await Carrito.findOne({
    usuarioId: usuarioId || null,
    estado: "ACTIVO",
  }).populate("items.productoId", "nombreProducto precio inventario img");

  //Si no existe, crear uno nuevo
  if (!carrito) {
    carrito = new Carrito({
      usuarioId,
      estado: "ACTIVO",
      items: [],
      subtotal: 0,
      total: 0,
    });
    await carrito.save();
  }
  return carrito;
};

/**
 * Agregar producto al carrito
 *
 * @param {String} usuarioId - ID del usuario
 * @param {String} productoId - ID del producto
 * @param {Number} cantidad - Cantidad a agregar (default: 1)
 * @returns {Promise<Object>} carrito actualizado
 * @throws {Error} Si producto no existe o sin stock
 */

const agregarProducto = async (usuarioId, productoId, cantidad = 1) => {
  // Validar ObjectId
  if (!validObjectId(productoId)) {
    throw new Error("El id del producto no es válido");
  }

  //Validar cantidad
  const cantidadNum = Number(cantidad);
  if (isNaN(cantidadNum) || cantidadNum <= 0) {
    throw new Error("La cantidad debe ser un número mayor a 0");
  }

  //Verificar que el producto existe y esta activo
  const producto = await Producto.findById(productoId);
  if (!producto || !producto.estado) {
    throw new Error("El producto no existe o no está disponible");
  }

  //Obtener carrito activo (o crear uno nuevo)
  const carrito = await obtenerCarritoActivo(usuarioId);

  //Verificar si el producto ya esta en el carrito
  const itemExistente = carrito.items.find(
    (item) => item.productoId.toString() === productoId,
  );

  if (itemExistente) {
    //Producto ya existe --> incrementar cantidad
    const nuevaCantidad = itemExistente.cantidad + cantidadNum;

    //Validar stock disponible
    if (nuevaCantidad > producto.inventario) {
      throw new Error(
        `Stock insuficiente. Disponible: ${producto.inventario}, Solicitado: ${nuevaCantidad}`,
      );
    }

    itemExistente.cantidad = nuevaCantidad;
  } else {
    //Producto no existe --> agregar nuevo item
    //Validar stock disponible
    if (cantidadNum > producto.inventario) {
      throw new Error(
        `Stock insuficiente. Disponible: ${producto.inventario}, Solicitado: ${cantidadNum}`,
      );
    }

    //Crear snapshot del producto
    const { nombreSnapshot, precioSnapshot } = copiarSnapshotProducto(producto);

    //Agregar nuevo item al carrito
    carrito.items.push({
      productoId: producto._id,
      nombreSnapshot,
      precioSnapshot,
      cantidad: cantidadNum,
      subtotal: 0, // se calculará luego
    });
  }

  //Recalcular totales del carrito
  const { items, subtotal, total } = calcularTotalesCarrito(carrito.items);
  carrito.items = items;
  carrito.subtotal = subtotal;
  carrito.total = total;

  //Guardar cambios
  await carrito.save();

  //Popular productos antes de retornar

  await carrito.populate(
    "items.productoId",
    "nombreProducto precio inventario img",
  );

  return carrito;
};

/**
 * Actualizar cantidad de un item en el carrito
 *
 * @param {String} usuarioId - ID del usuario
 * @param {String} productoId - ID del producto a actualizar
 * @param {Number} nuevaCantidad - Nueva cantidad (debe ser > 0)
 * @returns {Promise<Object>} carrito actualizado
 * @throws {Error} Si item no existe o stock insuficiente
 */

const actualizarCantidad = async (usuarioId, productoId, nuevaCantidad) => {
  // Validar ObjectId
  if (!validObjectId(productoId)) {
    throw new Error("El id del producto no es válido");
  }

  //Validad nueva cantidad
  const cantidadNum = Number(nuevaCantidad);
  if (isNaN(cantidadNum) || cantidadNum <= 0) {
    throw new Error("La cantidad debe ser un número mayor a 0");
  }

  //Obtener carrito activo
  const carrito = await obtenerCarritoActivo(usuarioId);

  //Buscar el item en el carrito
  const item = carrito.items.find(
    (item) => item.productoId.toString() === productoId,
  );

  if (!item) {
    throw new Error("El producto no está en el carrito");
  }

  //Validar stock del producto
  const producto = await Producto.findById(productoId);
  if (!producto || !producto.estado) {
    throw new Error("El producto no existe o no está disponible");
  }

  if (cantidadNum > producto.inventario) {
    throw new Error(
      `Stock insuficiente. Disponible: ${producto.inventario}, Solicitado: ${cantidadNum}`,
    );
  }

  //Actualizar cantidad
  item.cantidad = cantidadNum;

  //Recalcular totales del carrito
  const { items, subtotal, total } = calcularTotalesCarrito(carrito.items);
  carrito.items = items;
  carrito.subtotal = subtotal;
  carrito.total = total;

  //Guardar cambios
  await carrito.save();
  await carrito.populate(
    "items.productoId",
    "nombreProducto precio inventario img",
  );

  return carrito;
};

/**
 * Eliminar un producto del carrito
 *
 * @param {String} usuarioId - ID del usuario
 * @param {String} productoId - ID del producto a eliminar
 * @returns {Promise<Object>} carrito actualizado
 * @throws {Error} Si item no existe
 */

const eliminarProducto = async (usuarioId, productoId) => {
  // Validar ObjectId
  if (!validObjectId(productoId)) {
    throw new Error("El id del producto no es válido");
  }

  //Obtener carrito activo
  const carrito = await obtenerCarritoActivo(usuarioId);

  //Buscar el item en el carrito
  const itemIndex = carrito.items.findIndex(
    (item) => item.productoId.toString() === productoId,
  );

  if (itemIndex === -1) {
    throw new Error("El producto no está en el carrito");
  }

  //Eliminar el item del carrito
  carrito.items.splice(itemIndex, 1);
  //Recalcular totales del carrito
  const { items, subtotal, total } = calcularTotalesCarrito(carrito.items);
  carrito.items = items;
  carrito.subtotal = subtotal;
  carrito.total = total;

  //Guardar cambios
  await carrito.save();
  await carrito.populate(
    "items.productoId",
    "nombreProducto precio inventario img",
  );

  return carrito;
};

/**
 * Vaciar carrito completamente
 *
 * @param {String} usuarioId - ID del usuario
 * @returns {Promise<Object>} carrito vacío
 */

const vaciarCarrito = async (usuarioId) => {
  //Obtener carrito activo
  const carrito = await obtenerCarritoActivo(usuarioId);

  //Vaciar items
  carrito.items = [];
  carrito.subtotal = 0;
  carrito.total = 0;

  //Guardar cambios
  await carrito.save();

  return carrito;
};

/**
 * Cambiar estado del carrito
 *
 * @param {String} carritoId - ID del carrito
 * @param {String} nuevoEstado - Nuevo estado (ACTIVO, CHEQUEANDO, COMPLETADO, EXPIRADO)
 * @returns {Promise<Object>} carrito actualizado
 * @throws {Error} Si transición inválida
 */

const cambiarEstado = async (carritoId, nuevoEstado) => {
  // Validar ObjectId
  if (!validObjectId(carritoId)) {
    throw new Error("El ID del carrito no es válido");
  }

  // Validar estado
  const estadosValidos = ["ACTIVO", "CHEQUEANDO", "COMPLETADO", "EXPIRADO"];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error("Estado inválido");
  }

  const carrito = await Carrito.findById(carritoId);
  if (!carrito) {
    throw new Error("Carrito no encontrado");
  }

  // Validar transiciones (puedes hacerlo más estricto)
  // Por ahora permitimos cualquier transición
  carrito.estado = nuevoEstado;
  await carrito.save();

  return carrito;
};

module.exports = {
  obtenerCarritoActivo,
  agregarProducto,
  actualizarCantidad,
  eliminarProducto,
  vaciarCarrito,
  cambiarEstado,
};
