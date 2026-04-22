describe("Verificación del Entorno de Testing", () => {
  test("Jest está configurado correctamente", () => {
    expect(true).toBe(true);
  });

  test("Variables de entorno de test están disponibles", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(process.env.JWT_ACCESS_SECRET).toBeDefined();
    expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
  });

  test("Mongoose está disponible", () => {
    const mongoose = require("mongoose");
    expect(mongoose).toBeDefined();
    expect(typeof mongoose.connect).toBe("function");
  });
});
