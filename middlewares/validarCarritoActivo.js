const Carrito = require('../models/Carrito');

const validarCarritoActivo = async (req, res, next) => { 
    const { carritoId } = req.params;

    const carrito = await Carrito.findById(carritoId);

    if (!carrito) {
        return res.status(404).json({
            errors: [{ msg: "Carrito no encontrado" }],
        });
    }

    if (carrito.estado !== "activo") {
        return res.status(400).json({
            errors: [{ msg: "El carrito no está activo" }],
        });
    }

    req.carrito = carrito;
    next();
};

module.exports = { validarCarritoActivo };