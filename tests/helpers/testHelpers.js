// Helpers para tests: funciones de utilidad comunes
const jwt = require('jsonwebtoken');
const Usuario = require('../../models/usuario');

// Generar token JWT para tests
const generarTokenTest = (uid = '507f1f77bcf86cd799439011') => {
    return jwt.sign({ uid }, process.env.SECRETORPRIVATEKEY, { expiresIn: '4h' });
};

// Crear usuario en base de datos de test
const crearUsuarioTest = async (datosUsuario = {}) => {
    const bcryptjs = require('bcryptjs');
    
    const usuarioDefault = {
        nombre: 'Test User',
        correo: 'test@example.com',
        password: 'Password123!',
        rol: 'USER_ROLE',
        ...datosUsuario
    };
    
    // Encriptar password
    const salt = bcryptjs.genSaltSync(10);
    usuarioDefault.password = bcryptjs.hashSync(usuarioDefault.password, salt);
    
    const usuario = new Usuario(usuarioDefault);
    await usuario.save();
    
    return usuario;
};

// Crear usuario admin en base de datos de test
const crearAdminTest = async () => {
    return await crearUsuarioTest({
        nombre: 'Admin Test',
        correo: 'admin@test.com',
        rol: 'ADMIN_ROLE'
    });
};

// Limpiar todas las colecciones
const limpiarBaseDatos = async () => {
    const mongoose = require('mongoose');
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

module.exports = {
    generarTokenTest,
    crearUsuarioTest,
    crearAdminTest,
    limpiarBaseDatos
};
