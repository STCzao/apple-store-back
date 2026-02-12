// Test E2E: Flujo completo de compra
const request = require('supertest');
const { getApp } = require('../helpers/appHelper');
const Producto = require('../../models/producto');
const Categoria = require('../../models/categoria');

describe('E2E: Flujo completo de compra', () => {
    let app;
    let token;
    let categoriaId;
    let productoId1;
    let productoId2;
    const Usuario = require('../../models/usuario');

    beforeAll(async () => {
        // Desactivar limpieza automática de DB para tests E2E
        global.skipDbCleanup = true;
        
        app = getApp();

        // Crear usuario administrativo para las categorías y productos
        const usuarioAdmin = await Usuario.create({
            nombreUsuario: 'Admin Usuario',
            correo: `admin${Date.now()}@ejemplo.com`,
            contraseña: 'AdminPassword123!',
            telefono: '1155667788',
            DNI: '98765432',
            CUIL: '20-98765432-9',
            domicilioFiscal: {
                calle: 'Av. Admin',
                numero: '100',
                ciudad: 'Buenos Aires',
                provincia: 'CABA',
                codigoPostal: '1001'
            },
            estado: true
        });

        // Crear categoría con usuarioId
        const categoria = await Categoria.create({
            nombreCategoria: 'Electrónicos',
            descripcion: 'Productos electrónicos',
            usuario: usuarioAdmin._id
        });
        categoriaId = categoria._id;

        // Crear productos de prueba
        const producto1 = await Producto.create({
            nombreProducto: 'iPhone 15 Pro Max',
            marca: 'Apple',
            precio: 1199.99,
            descripcion: 'Smartphone Apple con 256GB',
            inventario: 50,
            categoria: categoriaId,
            creadoPor: usuarioAdmin._id,
            estado: true
        });
        productoId1 = producto1._id;

        const producto2 = await Producto.create({
            nombreProducto: 'AirPods Pro 2',
            marca: 'Apple',
            precio: 249.99,
            descripcion: 'Auriculares con cancelación de ruido',
            inventario: 100,
            categoria: categoriaId,
            creadoPor: usuarioAdmin._id,
            estado: true
        });
        productoId2 = producto2._id;
    });

    describe('Flujo de compra exitoso', () => {
        
        test('1. Usuario se registra en la plataforma', async () => {
            const nuevoUsuario = {
                nombreUsuario: 'Cliente Compra',
                correo: `cliente${Date.now()}@ejemplo.com`,
                contraseña: 'Password123!',
                telefono: '1155667788',
                DNI: '12345678',
                CUIL: '20-12345678-9',
                domicilioFiscal: {
                    calle: 'Av. Test',
                    numero: '123',
                    ciudad: 'Buenos Aires',
                    provincia: 'CABA',
                    codigoPostal: '1001'
                }
            };

            const response = await request(app)
                .post('/api/auth/registro')
                .send(nuevoUsuario)
                .expect(201);

            expect(response.body.usuario).toBeDefined();
            expect(response.body.usuario.uid).toBeDefined();
            expect(response.body.token).toBeDefined();

            // Guardar token para siguientes pasos
            token = response.body.token;
        });

        test('2. Usuario agrega primer producto al carrito', async () => {
            const item = {
                productoId: productoId1.toString(),
                cantidad: 2
            };

            const response = await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send(item)
                .expect(201);

            expect(response.body.carrito).toBeDefined();
            expect(response.body.carrito.items).toHaveLength(1);
            
            // Verificar total: 1199.99 * 2 = 2399.98
            expect(response.body.carrito.total).toBeCloseTo(2399.98, 2);
        });

        test('3. Usuario agrega segundo producto al carrito', async () => {
            const item = {
                productoId: productoId2.toString(),
                cantidad: 1
            };

            const response = await request(app)
                .post('/api/carrito')
                .set('x-token', token)
                .send(item)
                .expect(201);

            expect(response.body.carrito).toBeDefined();
            expect(response.body.carrito.items).toHaveLength(2);
            
            // Verificar total: 2399.98 + 249.99 = 2649.97
            expect(response.body.carrito.total).toBeCloseTo(2649.97, 2);
        });

        test('4. Usuario consulta su carrito', async () => {
            const response = await request(app)
                .get('/api/carrito')
                .set('x-token', token)
                .expect(200);

            expect(response.body.carrito).toBeDefined();
            expect(response.body.carrito.items).toHaveLength(2);
            expect(response.body.carrito.total).toBeCloseTo(2649.97, 2);
        });

        test('5. Usuario actualiza cantidad de primer producto', async () => {
            const response = await request(app)
                .put(`/api/carrito/${productoId1}`)
                .set('x-token', token)
                .send({ cantidad: 3 })
                .expect(200);

            expect(response.body.carrito).toBeDefined();
            
            // Verificar nuevo total: (1199.99 * 3) + 249.99 = 3849.96
            expect(response.body.carrito.total).toBeCloseTo(3849.96, 2);
        });

        test('6. Usuario crea orden desde su carrito', async () => {
            const response = await request(app)
                .post('/api/orden')
                .set('x-token', token)
                .expect(201);

            expect(response.body.orden).toBeDefined();
            expect(response.body.orden.items).toHaveLength(2);
            expect(response.body.orden.total).toBeCloseTo(3849.96, 2);
            expect(response.body.orden.estadoOrden).toBe('pendiente');
        });

        test('7. Carrito queda vacío después de crear la orden', async () => {
            const response = await request(app)
                .get('/api/carrito')
                .set('x-token', token)
                .expect(200);

            expect(response.body.carrito.items).toHaveLength(0);
            expect(response.body.carrito.total).toBe(0);
        });

        test('8. Stock de productos se actualizó correctamente', async () => {
            // Verificar que el inventario disminuyó
            const producto1 = await Producto.findById(productoId1);
            const producto2 = await Producto.findById(productoId2);

            // Producto 1: 50 - 3 = 47
            expect(producto1.inventario).toBe(47);
            
            // Producto 2: 100 - 1 = 99
            expect(producto2.inventario).toBe(99);
        });
    });

    describe('Flujos de error', () => {
        
        let tokenNuevo;

        beforeEach(async () => {
            // Crear nuevo usuario para cada test de error
            const timestamp = Date.now();
            // Generar DNI válido de 8 dígitos único (30000000 a 39999999 para evitar colisiones)
            const dni = String(30000000 + (timestamp % 10000000));
            // Email corto para no exceder el límite de 35 caracteres
            const emailSuffix = String(timestamp).slice(-6);
            const response = await request(app)
                .post('/api/auth/registro')
                .send({
                    nombreUsuario: 'Usuario Error Test',
                    correo: `err${emailSuffix}@test.com`,
                    contraseña: 'Password123!',
                    telefono: '1155667788',
                    DNI: dni,
                    CUIL: `20-${dni}-9`,
                    domicilioFiscal: {
                        calle: 'Av. Test',
                        numero: '123',
                        ciudad: 'Buenos Aires',
                        provincia: 'CABA',
                        codigoPostal: '1001'
                    }
                })
                .expect(201);
            
            tokenNuevo = response.body.token;
        });

        test('No debe permitir crear orden con carrito vacío', async () => {
            const response = await request(app)
                .post('/api/orden')
                .set('x-token', tokenNuevo)
                .expect(400);

            expect(response.body.errors).toBeDefined();
        });

        test('No debe permitir agregar cantidad mayor al stock disponible', async () => {
            // Producto 1 ahora tiene inventario = 47 (después del test anterior)
            const item = {
                productoId: productoId1.toString(),
                cantidad: 100 // Más de lo disponible
            };

            const response = await request(app)
                .post('/api/carrito')
                .set('x-token', tokenNuevo)
                .send(item)
                .expect(400);

            expect(response.body.errors).toBeDefined();
        });

        test('No debe permitir acciones sin autenticación', async () => {
            const responsesCarrito = await request(app)
                .get('/api/carrito')
                .expect(401);

            const responseOrden = await request(app)
                .post('/api/orden')
                .expect(401);

            expect(responsesCarrito.body.errors).toBeDefined();
            expect(responseOrden.body.errors).toBeDefined();
        });
    });

    describe('Flujo: Usuario actualiza y elimina items antes de comprar', () => {
        
        let tokenCliente;

        beforeAll(async () => {
            const timestamp = Date.now();
            // Generar DNI válido de 8 dígitos único (50000000 a 59999999 para evitar colisiones)
            const dni = String(50000000 + (timestamp % 10000000));
            // Email corto para no exceder el límite de 35 caracteres
            const emailSuffix = String(timestamp).slice(-6);
            const response = await request(app)
                .post('/api/auth/registro')
                .send({
                    nombreUsuario: 'Cliente Modificador',
                    correo: `mod${emailSuffix}@test.com`,
                    contraseña: 'Password123!',
                    telefono: '1155667788',
                    DNI: dni,
                    CUIL: `20-${dni}-9`,
                    domicilioFiscal: {
                        calle: 'Av. Test',
                        numero: '123',
                        ciudad: 'Buenos Aires',
                        provincia: 'CABA',
                        codigoPostal: '1001'
                    }
                });
            
            if (response.status !== 201) {
                console.error('Error en beforeAll registro:', response.status, response.body);
            }
            expect(response.status).toBe(201);
            tokenCliente = response.body.token;
        });

        test('1. Agrega múltiples productos', async () => {
            await request(app)
                .post('/api/carrito')
                .set('x-token', tokenCliente)
                .send({ productoId: productoId1.toString(), cantidad: 2 })
                .expect(201);

            const response = await request(app)
                .post('/api/carrito')
                .set('x-token', tokenCliente)
                .send({ productoId: productoId2.toString(), cantidad: 3 })
                .expect(201);

            expect(response.body.carrito.items).toHaveLength(2);
        });

        test('2. Elimina un producto del carrito', async () => {
            const response = await request(app)
                .delete(`/api/carrito/${productoId2}`)
                .set('x-token', tokenCliente)
                .expect(200);

            expect(response.body.carrito.items).toHaveLength(1);
        });

        test('3. Actualiza cantidad del producto restante', async () => {
            const response = await request(app)
                .put(`/api/carrito/${productoId1}`)
                .set('x-token', tokenCliente)
                .send({ cantidad: 5 })
                .expect(200);

            expect(response.body.carrito.items[0].cantidad).toBe(5);
        });

        test('4. Crea orden con el carrito modificado', async () => {
            const response = await request(app)
                .post('/api/orden')
                .set('x-token', tokenCliente)
                .expect(201);

            expect(response.body.orden.items).toHaveLength(1);
            expect(response.body.orden.items[0].cantidad).toBe(5);
        });
    });
    
    afterAll(() => {
        // Restaurar limpieza automática después de tests E2E
        global.skipDbCleanup = false;
    });
});
