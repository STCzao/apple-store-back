const Orden = require("../models/orden");

const validarOrden = async (req, res, next) => {
  const { ordenId } = req.params;
  const usuarioId = req.usuario._id;

  const orden = await Orden.findById(ordenId);

  if (!orden) {
    return res.status(404).json({
      msg: "Orden no encontrada",
    });
  }

  if (orden.usuarioId.toString() !== usuarioId.toString()) {
    return res.status(403).json({
      msg: "No tenés permiso para acceder a esta orden",
    });
  }

  if (orden.estado !== "PENDIENTE_PAGO") {
    return res.status(400).json({
      msg: `La orden no está pendiente de pago (estado actual: ${orden.estado})`,
    });
  }

  req.orden = orden;
  next();
};

module.exports = { validarOrden };
