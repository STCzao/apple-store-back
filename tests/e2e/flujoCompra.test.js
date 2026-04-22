const request = require("supertest");
const { getApp } = require("../helpers/appHelper");
const { crearUsuarioVerificado } = require("../helpers/testHelpers");
const Categoria = require("../../src/models/Categoria");
const Producto = require("../../src/models/Producto");

const app = getApp();

let token;
let productoId1;
let productoId2;

beforeAll(async () => {
  const { usuario, token: t } = await crearUsuarioVerificado({
    correo: "e2e@ejemplo.com",
    nombreUsuario: "Usuario Catalogo",
  });
  token = t;

  const categoria = await Categoria.create({
    nombreCategoria: "electronicos-e2e",
    creadoPor: usuario._id,
  });

  const p1 = await Producto.create({
    nombreProducto: "iphone quince pro e2e",
    marca: "apple",
    precio: 1199.99,
    descripcion: "Smartphone Apple de alta gama para test e2e",
    categoria: categoria._id,
    creadoPor: usuario._id,
    estado: true,
  });
  productoId1 = p1._id.toString();

  const p2 = await Producto.create({
    nombreProducto: "airpods pro e2e",
    marca: "apple",
    precio: 249.99,
    descripcion: "Auriculares Apple con cancelacion de ruido para test e2e",
    categoria: categoria._id,
    creadoPor: usuario._id,
    estado: true,
  });
  productoId2 = p2._id.toString();
});

describe("E2E: Flujo catálogo y favoritos", () => {
  test("Flujo completo: agregar, consultar y eliminar favoritos", async () => {
    // 1. Favoritos vacíos al inicio
    const r1 = await request(app)
      .get("/api/favorito")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(r1.body.total).toBe(0);

    // 2. Agrega primer producto
    const r2 = await request(app)
      .post(`/api/favorito/${productoId1}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(201);
    expect(r2.body.favorito).toBeDefined();

    // 3. Agrega segundo producto
    const r3 = await request(app)
      .post(`/api/favorito/${productoId2}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(201);
    expect(r3.body.favorito).toBeDefined();

    // 4. Consulta y ve ambos
    const r4 = await request(app)
      .get("/api/favorito")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(r4.body.total).toBe(2);
    expect(r4.body.favoritos).toHaveLength(2);

    // 5. No puede agregar el mismo producto dos veces
    const r5 = await request(app)
      .post(`/api/favorito/${productoId1}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(409);
    expect(r5.body.message).toBeDefined();

    // 6. Elimina un favorito
    const r6 = await request(app)
      .delete(`/api/favorito/${productoId1}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(r6.body.message).toBeDefined();

    // 7. Queda un solo favorito
    const r7 = await request(app)
      .get("/api/favorito")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(r7.body.total).toBe(1);
    expect(r7.body.favoritos).toHaveLength(1);
  });

  test("Acceso sin token es rechazado en todos los endpoints", async () => {
    const [r1, r2, r3] = await Promise.all([
      request(app).get("/api/favorito").expect(401),
      request(app).post(`/api/favorito/${productoId1}`).expect(401),
      request(app).delete(`/api/favorito/${productoId1}`).expect(401),
    ]);

    expect(r1.body.message).toBeDefined();
    expect(r2.body.message).toBeDefined();
    expect(r3.body.message).toBeDefined();
  });
});
