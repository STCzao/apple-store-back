const request = require("supertest");
const bcryptjs = require("bcryptjs");
const { getApp } = require("../helpers/appHelper");
const Usuario = require("../../src/models/Usuario");

const app = getApp();

const crearUsuarioVerificado = async (datos = {}) => {
  const correo = datos.correo || `test${Date.now()}@ejemplo.com`;
  const contraseña = datos.contraseña || "Password123!";
  const hash = await bcryptjs.hash(contraseña, 10);

  await Usuario.create({
    nombreUsuario: datos.nombreUsuario || "Usuario Test",
    correo,
    fechaNacimiento: datos.fechaNacimiento || "1990-01-01",
    contraseña: hash,
    emailVerificado: true,
    estado: datos.estado !== undefined ? datos.estado : true,
    rol: datos.rol || "USER_ROLE",
  });

  return { correo, contraseña };
};

describe("Endpoints de Autenticación (/api/auth)", () => {
  describe("POST /api/auth/registro", () => {
    test("Debe registrar un nuevo usuario correctamente (201)", async () => {
      const response = await request(app)
        .post("/api/auth/registro")
        .send({
          nombreUsuario: "Usuario Registro",
          correo: "registro@ejemplo.com",
          fechaNacimiento: "1990-05-15",
          contraseña: "Password123!",
          confirmarContraseña: "Password123!",
        })
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body.usuario).toBeDefined();
      expect(response.body.usuario.correo).toBe("registro@ejemplo.com");
      expect(response.body.usuario.contraseña).toBeUndefined();
      expect(response.body.message).toBeDefined();
    });

    test("Debe asignar rol USER_ROLE por defecto", async () => {
      const response = await request(app)
        .post("/api/auth/registro")
        .send({
          nombreUsuario: "Usuario Default",
          correo: "default@ejemplo.com",
          fechaNacimiento: "1990-05-15",
          contraseña: "Password123!",
          confirmarContraseña: "Password123!",
        })
        .expect(201);

      expect(response.body.usuario.rol).toBe("USER_ROLE");
    });

    test("Debe rechazar registro con correo duplicado (409)", async () => {
      const datos = {
        nombreUsuario: "Usuario Dup",
        correo: "dup@ejemplo.com",
        fechaNacimiento: "1990-05-15",
        contraseña: "Password123!",
        confirmarContraseña: "Password123!",
      };

      await request(app).post("/api/auth/registro").send(datos).expect(201);

      const response = await request(app)
        .post("/api/auth/registro")
        .send(datos)
        .expect(409);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar registro sin correo (400)", async () => {
      const response = await request(app)
        .post("/api/auth/registro")
        .send({ nombreUsuario: "Sin Email", contraseña: "Password123!" })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar registro con correo inválido (400)", async () => {
      const response = await request(app)
        .post("/api/auth/registro")
        .send({
          nombreUsuario: "Email Malo",
          correo: "esto-no-es-un-email",
          contraseña: "Password123!",
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar registro con contraseña débil (400)", async () => {
      const response = await request(app)
        .post("/api/auth/registro")
        .send({
          nombreUsuario: "Password Debil",
          correo: "debil@ejemplo.com",
          contraseña: "123",
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    test("Debe hacer login correctamente con credenciales válidas (200)", async () => {
      const { correo, contraseña } = await crearUsuarioVerificado({
        correo: "login@ejemplo.com",
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ correo, contraseña })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.usuario).toBeDefined();
      expect(response.body.usuario.correo).toBe(correo);
      expect(response.body.accessToken).toBeDefined();
      expect(typeof response.body.accessToken).toBe("string");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    test("Debe rechazar login con correo inexistente (401)", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ correo: "noexiste@ejemplo.com", contraseña: "Password123!" })
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar login con contraseña incorrecta (401)", async () => {
      const { correo } = await crearUsuarioVerificado({
        correo: "wrongpass@ejemplo.com",
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ correo, contraseña: "PasswordIncorrecta123!" })
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar login sin correo (400)", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ contraseña: "Password123!" })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar login de usuario inactivo (403)", async () => {
      const { correo, contraseña } = await crearUsuarioVerificado({
        correo: "inactivo@ejemplo.com",
        estado: false,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ correo, contraseña })
        .expect(403);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar login de usuario sin email verificado (403)", async () => {
      const hash = await bcryptjs.hash("Password123!", 10);
      await Usuario.create({
        nombreUsuario: "No Verificado",
        correo: "noverif@ejemplo.com",
        fechaNacimiento: "1990-01-01",
        contraseña: hash,
        emailVerificado: false,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ correo: "noverif@ejemplo.com", contraseña: "Password123!" })
        .expect(403);

      expect(response.body.message).toBeDefined();
    });
  });

  describe("POST /api/auth/refresh", () => {
    test("Debe renovar el access token con cookie válida (200)", async () => {
      const { correo, contraseña } = await crearUsuarioVerificado({
        correo: "refresh@ejemplo.com",
      });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ correo, contraseña });

      const cookies = loginRes.headers["set-cookie"];

      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", cookies)
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.usuario).toBeDefined();
    });

    test("Debe rechazar refresh sin cookie (401)", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
  });

  describe("POST /api/auth/logout", () => {
    test("Debe cerrar sesión y limpiar la cookie (200)", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .expect(200);

      expect(response.body.message).toBeDefined();
    });
  });

  describe("POST /api/auth/reenviar-verificacion", () => {
    test("Debe responder con mensaje genérico para correo no verificado (200)", async () => {
      const hash = await bcryptjs.hash("Password123!", 10);
      await Usuario.create({
        nombreUsuario: "Sin Verificar",
        correo: "sinverif@ejemplo.com",
        fechaNacimiento: "1990-01-01",
        contraseña: hash,
        emailVerificado: false,
      });

      const response = await request(app)
        .post("/api/auth/reenviar-verificacion")
        .send({ correo: "sinverif@ejemplo.com" })
        .expect(200);

      expect(response.body.message).toBeDefined();
    });

    test("Debe responder con mensaje genérico para correo inexistente (200)", async () => {
      const response = await request(app)
        .post("/api/auth/reenviar-verificacion")
        .send({ correo: "noexiste@ejemplo.com" })
        .expect(200);

      expect(response.body.message).toBeDefined();
    });

    test("Debe responder con mensaje genérico para usuario ya verificado (200)", async () => {
      const { correo } = await crearUsuarioVerificado({ correo: "yaverif@ejemplo.com" });

      const response = await request(app)
        .post("/api/auth/reenviar-verificacion")
        .send({ correo })
        .expect(200);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar correo inválido (400)", async () => {
      const response = await request(app)
        .post("/api/auth/reenviar-verificacion")
        .send({ correo: "no-es-un-correo" })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });
});
