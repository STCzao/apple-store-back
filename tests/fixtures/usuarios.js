const generarUsuarioCompleto = (datos = {}) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9000) + 1000;

  return {
    nombreUsuario: datos.nombreUsuario || `Usuario Test ${random}`,
    correo: datos.correo || `test${timestamp}${random}@ejemplo.com`,
    contraseña: datos.contraseña || "Password123!",
    rol: datos.rol || "USER_ROLE",
    estado: datos.estado !== undefined ? datos.estado : true,
  };
};

module.exports = { generarUsuarioCompleto };
