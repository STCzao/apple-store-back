const request = require("supertest");
const { getApp } = require("../helpers/appHelper");
const { crearUsuarioVerificado } = require("../helpers/testHelpers");
const Categoria = require("../../src/models/Categoria");
const Producto = require("../../src/models/Producto");

const app = getApp();

let token;
let productoId;
let productoId2;

beforeEach(async () => {
  const { usuario, token: t } = await crearUsuarioVerificado();
  token = t;

  const categoria = await Categoria.create({
    nombreCategoria: `categoria-test-${Date.now()}`,
    creadoPor: usuario._id,
  });

  const ts = Date.now();

  const p1 = await Producto.create({
    nombreProducto: `iphone test ${ts}`,
    marca: "apple",
    precio: 999,
    descripcion: "Smartphone Apple de prueba para testing",
    categoria: categoria._id,
    creadoPor: usuario._id,
    estado: true,
  });
  productoId = p1._id.toString();

  const p2 = await Producto.create({
    nombreProducto: `macbook test ${ts}`,
    marca: "apple",
    precio: 1999,
    descripcion: "Laptop Apple de prueba para testing",
    categoria: categoria._id,
    creadoPor: usuario._id,
    estado: true,
  });
  productoId2 = p2._id.toString();
});

describe("Endpoints de Favoritos (/api/favorito)", () => {
  describe("GET /api/favorito", () => {
    test("Debe retornar lista vacía para usuario sin favoritos (200)", async () => {
      const response = await request(app)
        .get("/api/favorito")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.total).toBe(0);
      expect(response.body.favoritos).toHaveLength(0);
    });

    test("Debe rechazar request sin autenticación (401)", async () => {
      const response = await request(app).get("/api/favorito").expect(401);
      expect(response.body.message).toBeDefined();
    });
  });

  describe("POST /api/favorito/:productoId", () => {
    test("Debe agregar un producto a favoritos (201)", async () => {
      const response = await request(app)
        .post(`/api/favorito/${productoId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(201);

      expect(response.body.favorito).toBeDefined();
    });

    test("Debe reflejar el favorito en el GET posterior", async () => {
      await request(app)
        .post(`/api/favorito/${productoId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(201);

      const response = await request(app)
        .get("/api/favorito")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.favoritos).toHaveLength(1);
    });

    test("Debe rechazar agregar el mismo producto dos veces (409)", async () => {
      await request(app)
        .post(`/api/favorito/${productoId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(201);

      const response = await request(app)
        .post(`/api/favorito/${productoId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(409);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar producto inexistente (404)", async () => {
      const response = await request(app)
        .post("/api/favorito/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar ObjectId inválido (400)", async () => {
      const response = await request(app)
        .post("/api/favorito/id-invalido")
        .set("Authorization", `Bearer ${token}`)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar sin autenticación (401)", async () => {
      const response = await request(app)
        .post(`/api/favorito/${productoId}`)
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
  });

  describe("DELETE /api/favorito/:productoId", () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/favorito/${productoId}`)
        .set("Authorization", `Bearer ${token}`);
    });

    test("Debe eliminar un favorito correctamente (200)", async () => {
      const response = await request(app)
        .delete(`/api/favorito/${productoId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBeDefined();
    });

    test("Debe quedar vacío luego de eliminar el único favorito", async () => {
      await request(app)
        .delete(`/api/favorito/${productoId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const response = await request(app)
        .get("/api/favorito")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.total).toBe(0);
    });

    test("Debe rechazar eliminar producto que no está en favoritos (404)", async () => {
      const response = await request(app)
        .delete(`/api/favorito/${productoId2}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBeDefined();
    });

    test("Debe rechazar sin autenticación (401)", async () => {
      const response = await request(app)
        .delete(`/api/favorito/${productoId}`)
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
  });

  describe("Flujo completo: agregar múltiples y consultar", () => {
    test("Debe acumular total al agregar varios favoritos", async () => {
      await request(app)
        .post(`/api/favorito/${productoId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(201);

      await request(app)
        .post(`/api/favorito/${productoId2}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(201);

      const response = await request(app)
        .get("/api/favorito")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.total).toBe(2);
      expect(response.body.favoritos).toHaveLength(2);
    });
  });
});
