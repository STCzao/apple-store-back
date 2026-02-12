// Tests de integración para endpoints de carrito
const request = require('supertest');
const { getApp } = require('../helpers/appHelper');
const Usuario = require('../../models/usuario');
const Producto = require('../../models/producto');
const Categoria = require('../../models/categoria');
const Carrito = require('../../models/Carrito');
const { generarUsuarioCompleto } = require('../fixtures/usuarios');

describe('Endpoints de Carrito (/api/carrito)', () => {
    let app;
    let token;
    let usuarioId;
    let productoId;
    let categoriaId;

    beforeAll(() => {
        app = getApp();
    });

    beforeEach(async () => {
        // Crear usuario y obtener token
        const nuevoUsuario = generarUsuarioCompleto({
            nombreUsuario: 'Usuario Carrito',
            correo: `carrito${Date.now()}@ejemplo.com`
        });

        const responseAuth = await request(app)
            .post('/api/auth/registro')
            .send(nuevoUsuario);

        token = responseAuth.body.token;
        usuarioId = responseAuth.body.usuario.uid;

        // Crear categoría (requiere nombreCategoria y usuario)
        const categoria = await Categoria.create({
            nombreCategoria: 'Smartphones',
            descripcion: 'Teléfonos inteligentes',
            usuario: usuarioId
        });
        categoriaId = categoria._id;

        // Crear producto de prueba
        const producto = await Producto.create({
            nombreProducto: 'iPhone 15 Pro',
            marca: 'Apple',
            precio: 1199.99,
            descripcion: 'Smartphone Apple de última generación',
            inventario: 10,
            categoria: categoriaId,
            creadoPor: usuarioId,
            estado: true
        });
        productoId = producto._id;
    });

    describe('POST /api/carrito', () => {
        
        test('Debe agregar un producto al carrito correctamente', async () => {
            const item = {
                productoId: productoId.toString(),
                cantidad: 2
            };

            const response = await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send(item)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.carrito).toBeDefined();
            expect(response.body.carrito.items).toHaveLength(1);
            expect(response.body.carrito.items[0].cantidad).toBe(2);
            expect(response.body.carrito.total).toBeCloseTo(2399.98, 2);
        });

        test('Debe incrementar cantidad si el producto ya existe en el carrito', async () => {
            const item = {
                productoId: productoId.toString(),
                cantidad: 2
            };

            // Primera adición
            await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send(item);

            // Segunda adición del mismo producto
            const response = await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send(item)
                .expect(201);

            expect(response.body.carrito.items).toHaveLength(1);
            expect(response.body.carrito.items[0].cantidad).toBe(4);
        });

        test('Debe rechazar agregar producto sin stock', async () => {
            // Crear producto sin stock
            const productoSinStock = await Producto.create({
                nombreProducto: 'Producto Agotado',
                marca: 'NoStock',
                precio: 999.99,
                descripcion: 'Sin stock disponible en inventario',
                inventario: 0,
                categoria: categoriaId,
                creadoPor: usuarioId,
                estado: true
            });

            const item = {
                productoId: productoSinStock._id.toString(),
                cantidad: 1
            };

            const response = await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send(item)
                .expect(400);

            expect(response.body.errors).toBeDefined();
        });

        test('Debe rechazar cantidad mayor al stock disponible', async () => {
            const item = {
                productoId: productoId.toString(),
                cantidad: 50 // Solo hay 10 en inventario
            };

            const response = await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send(item)
                .expect(400);

            expect(response.body.errors).toBeDefined();
        });

        test('Debe rechazar request sin autenticación', async () => {
            const item = {
                productoId: productoId.toString(),
                cantidad: 1
            };

            const response = await request(app)
                .post('/api/carrito')
                .send(item)
                .expect(401);

            expect(response.body.errors).toBeDefined();
        });

        test('Debe rechazar producto inválido', async () => {
            const item = {
                productoId: '507f1f77bcf86cd799439011', // ID que no existe
                cantidad: 1
            };

            const response = await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send(item)
                .expect(400);

            expect(response.body.errors).toBeDefined();
        });
    });

    describe('GET /api/carrito', () => {
        
        beforeEach(async () => {
            // Agregar items al carrito antes de cada test
            await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send({
                    productoId: productoId.toString(),
                    cantidad: 3
                });
        });

        test('Debe obtener el carrito activo del usuario', async () => {
            const response = await request(app)
                .get('/api/carrito')
                .set('x-token', token)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.carrito).toBeDefined();
            expect(response.body.carrito.items).toHaveLength(1);
        });

        test('Debe rechazar request sin autenticación', async () => {
            const response = await request(app)
                .get('/api/carrito')
                .expect(401);

            expect(response.body.errors).toBeDefined();
        });

        test('Debe crear carrito vacío si el usuario no tiene uno', async () => {
            // Crear nuevo usuario sin carrito
            const datosNuevoUsuario = generarUsuarioCompleto({
                nombreUsuario: 'Usuario Nuevo',
                correo: `nuevo${Date.now()}@ejemplo.com`
            });

            const nuevoUsuario = await request(app)
                .post('/api/auth/registro')
                .send(datosNuevoUsuario);

            const response = await request(app)
                .get('/api/carrito')
                .set('x-token', nuevoUsuario.body.token)
                .expect(200);

            expect(response.body.carrito.items).toHaveLength(0);
            expect(response.body.carrito.total).toBe(0);
        });
    });

    describe('DELETE /api/carrito/:productoId', () => {
        
        beforeEach(async () => {
            // Agregar item al carrito
            await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send({
                    productoId: productoId.toString(),
                    cantidad: 2
                });
        });

        test('Debe eliminar un producto del carrito correctamente', async () => {
            const response = await request(app)
                .delete(`/api/carrito/${productoId}`)
                .set('x-token', token)
                .expect(200);

            expect(response.body.carrito).toBeDefined();
            expect(response.body.carrito.items).toHaveLength(0);
            expect(response.body.carrito.total).toBe(0);
        });

        test('Debe rechazar eliminar producto inexistente del carrito', async () => {
            const productoInexistenteId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/api/carrito/${productoInexistenteId}`)
                .set('x-token', token)
                .expect(404);

            expect(response.body.errors).toBeDefined();
        });

        test('Debe rechazar request sin autenticación', async () => {
            const response = await request(app)
                .delete(`/api/carrito/${productoId}`)
                .expect(401);

            expect(response.body.errors).toBeDefined();
        });
    });

    describe('PUT /api/carrito/:productoId', () => {
        
        beforeEach(async () => {
            // Agregar item al carrito
            await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send({
                    productoId: productoId.toString(),
                    cantidad: 3
                });
        });

        test('Debe actualizar la cantidad de un producto en el carrito', async () => {
            const response = await request(app)
                .put(`/api/carrito/${productoId}`)
                .set('x-token', token)
                .send({ cantidad: 5 })
                .expect(200);

            expect(response.body.carrito).toBeDefined();
            expect(response.body.carrito.items[0].cantidad).toBe(5);
        });

        test('Debe rechazar actualizar con cantidad mayor al stock', async () => {
            const response = await request(app)
                .put(`/api/carrito/${productoId}`)
                .set('x-token', token)
                .send({ cantidad: 50 }) // Solo hay 10 en stock
                .expect(400);

            expect(response.body.errors).toBeDefined();
        });

        test('Debe rechazar cantidad 0 o negativa', async () => {
            const response = await request(app)
                .put(`/api/carrito/${productoId}`)
                .set('x-token', token)
                .send({ cantidad: 0 })
                .expect(400);

            expect(response.body.errors).toBeDefined();
            expect(Array.isArray(response.body.errors)).toBe(true);
        });

        test('Debe rechazar request sin autenticación', async () => {
            const response = await request(app)
                .put(`/api/carrito/${productoId}`)
                .send({ cantidad: 5 })
                .expect(401);

            expect(response.body.errors).toBeDefined();
        });
    });

    describe('DELETE /api/carrito', () => {
        
        beforeEach(async () => {
            // Agregar items al carrito
            await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send({
                    productoId: productoId.toString(),
                    cantidad: 2
                });
        });

        test('Debe vaciar el carrito correctamente', async () => {
            const response = await request(app)
                .delete('/api/carrito')
                .set('x-token', token)
                .expect(200);

            expect(response.body.carrito).toBeDefined();
            expect(response.body.carrito.items).toHaveLength(0);
            expect(response.body.carrito.total).toBe(0);
        });

        test('Debe rechazar request sin autenticación', async () => {
            const response = await request(app)
                .delete('/api/carrito')
                .expect(401);

            expect(response.body.errors).toBeDefined();
        });
    });
});
