// Fixtures: Datos de prueba reutilizables para tests
const bcryptjs = require('bcryptjs');

const usuariosFixture = {
    // Usuario administrador
    admin: {
        nombreUsuario: 'Admin Test',
        correo: 'admin@test.com',
        contraseña: 'Admin123!',
        telefono: '1155667788',
        DNI: '12345678',
        CUIL: '20-12345678-9',
        domicilioFiscal: {
            calle: 'Av. Libertador',
            numero: '1000',
            ciudad: 'Buenos Aires',
            provincia: 'CABA',
            codigoPostal: '1001'
        },
        rol: 'ADMIN_ROLE'
    },
    
    // Usuario normal
    usuario: {
        nombreUsuario: 'Usuario Test',
        correo: 'usuario@test.com',
        contraseña: 'User123!',
        telefono: '1144556677',
        DNI: '23456789',
        CUIL: '20-23456789-9',
        domicilioFiscal: {
            calle: 'Av. Corrientes',
            numero: '2000',
            ciudad: 'Buenos Aires',
            provincia: 'CABA',
            codigoPostal: '1045'
        },
        rol: 'USER_ROLE'
    },
    
    // Usuario para actualizaciones
    usuarioActualizar: {
        nombreUsuario: 'Usuario Actualizar',
        correo: 'actualizar@test.com',
        contraseña: 'Update123!',
        telefono: '1133445566',
        DNI: '34567890',
        CUIL: '20-34567890-9',
        domicilioFiscal: {
            calle: 'Av. Santa Fe',
            numero: '3000',
            ciudad: 'Buenos Aires',
            provincia: 'CABA',
            codigoPostal: '1425'
        },
        rol: 'USER_ROLE'
    }
};

// Helper: Crear usuario con contraseña encriptada
const crearUsuarioConPassword = async (datosUsuario) => {
    const salt = bcryptjs.genSaltSync(10);
    const contraseñaEncriptada = bcryptjs.hashSync(datosUsuario.contraseña, salt);
    
    return {
        ...datosUsuario,
        contraseña: contraseñaEncriptada
    };
};

// Helper: Generar datos de usuario completos para tests
const generarUsuarioCompleto = (datos = {}) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    return {
        nombreUsuario: datos.nombreUsuario || `Usuario Test ${random}`,
        correo: datos.correo || `test${timestamp}${random}@ejemplo.com`,
        contraseña: datos.contraseña || 'Password123!',
        telefono: datos.telefono || `11${String(timestamp).slice(-8)}`,
        DNI: datos.DNI || String(10000000 + random).slice(0, 8),
        CUIL: datos.CUIL || `20-${String(10000000 + random).slice(0, 8)}-9`,
        domicilioFiscal: datos.domicilioFiscal || {
            calle: 'Av. Test',
            numero: String(1000 + random),
            ciudad: 'Ciudad Test',
            provincia: 'Provincia Test',
            codigoPostal: String(1000 + random).slice(0, 4)
        },
        rol: datos.rol || 'USER_ROLE',
        estado: datos.estado !== undefined ? datos.estado: true
    };
};

module.exports = {
    usuariosFixture,
    crearUsuarioConPassword,
    generarUsuarioCompleto
};
