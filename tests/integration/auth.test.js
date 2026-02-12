// Tests de integración para endpoints de autenticación
const request = require('supertest');
const { getApp } = require('../helpers/appHelper');
const Usuario = require('../../models/usuario');
const { generarUsuarioCompleto } = require('../fixtures/usuarios');

describe('Endpoints de Autenticación (/api/auth)', () => {
    let app;

    beforeAll(() => {
        app = getApp();
    });

    describe('POST /api/auth/registro', () => {
        
        test('Debe registrar un nuevo usuario correctamente', async () => {
            const nuevoUsuario = generarUsuarioCompleto({
                nombreUsuario: 'Test Usuario',
                correo: 'test@ejemplo.com'
            });

            const response = await request(app)
                .post('/api/auth/registro')
                .send(nuevoUsuario)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.usuario).toBeDefined();
            expect(response.body.usuario.correo).toBe(nuevoUsuario.correo);
            expect(response.body.usuario.nombreUsuario).toBe(nuevoUsuario.nombreUsuario);
            expect(response.body.usuario.contraseña).toBeUndefined();
            expect(response.body.token).toBeDefined();
            expect(typeof response.body.token).toBe('string');
        });

        test('Debe asignar rol USER_ROLE por defecto', async () => {
            const nuevoUsuario = generarUsuarioCompleto({
                nombreUsuario: 'Usuario Default',
                correo: 'default@ejemplo.com'
            });

            const response = await request(app)
                .post('/api/auth/registro')
                .send(nuevoUsuario)
                .expect(201);

            expect(response.body.usuario.rol).toBe('USER_ROLE');
        });

        test('Debe rechazar registro con correo duplicado', async () => {
            const usuario = generarUsuarioCompleto({
                nombreUsuario: 'Usuario Uno',
                correo: 'duplicado@ejemplo.com'
            });

            // Primer registro
            await request(app)
                .post('/api/auth/registro')
                .send(usuario)
                .expect(201);

            // Segundo registro con mismo correo
            const response = await request(app)
                .post('/api/auth/registro')
                .send(usuario)
                .expect(400);

            expect(response.body.errors).toBeDefined();
        });

        test('Debe rechazar registro con datos incompletos', async () => {
            const usuarioIncompleto = {
                nombreUsuario: 'Usuario Sin Email',
                contraseña: 'Password123!'
            };

            const response = await request(app)
                .post('/api/auth/registro')
                .send(usuarioIncompleto)
                .expect(400);

            expect(response.body.errors).toBeDefined();
            expect(Array.isArray(response.body.errors)).toBe(true);
        });

        test('Debe rechazar registro con correo inválido', async () => {
            const usuarioEmailInvalido = generarUsuarioCompleto({
                nombreUsuario: 'Usuario Email Malo',
                correo: 'esto-no-es-un-email'
            });

            const response = await request(app)
                .post('/api/auth/registro')
                .send(usuarioEmailInvalido)
                .expect(400);

            expect(response.body.errors).toBeDefined();
            expect(Array.isArray(response.body.errors)).toBe(true);
        });

        test('Debe rechazar registro con contraseña débil', async () => {
            const usuarioPasswordDebil = generarUsuarioCompleto({
                nombreUsuario: 'Usuario Password Débil',
                correo: 'debil@ejemplo.com',
                contraseña: '123'
            });

            const response = await request(app)
                .post('/api/auth/registro')
                .send(usuarioPasswordDebil)
                .expect(400);

            expect(response.body.errors).toBeDefined();
            expect(Array.isArray(response.body.errors)).toBe(true);
        });
    });

    describe('POST /api/auth/login', () => {
        
        beforeEach(async () => {
            // Crear usuario de prueba antes de cada test de login
            const bcryptjs = require('bcryptjs');
            const salt = bcryptjs.genSaltSync(10);
            const contraseñaEncriptada = bcryptjs.hashSync('Password123!', salt);

            const usuarioCompleto = generarUsuarioCompleto({
                nombreUsuario: 'Usuario Login',
                correo: 'login@ejemplo.com'
            });

            usuarioCompleto.contraseña = contraseñaEncriptada;
            await Usuario.create(usuarioCompleto);
        });

        test('Debe hacer login correctamente con credenciales válidas', async () => {
            const credenciales = {
                correo: 'login@ejemplo.com',
                contraseña: 'Password123!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credenciales)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.usuario).toBeDefined();
            expect(response.body.usuario.correo).toBe(credenciales.correo);
            expect(response.body.token).toBeDefined();
            expect(typeof response.body.token).toBe('string');
        });

        test('Debe rechazar login con correo inexistente', async () => {
            const credenciales = {
                correo: 'noexiste@ejemplo.com',
                contraseña: 'Password123!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credenciales)
                .expect(400);

            expect(response.body.errors).toBeDefined();
        });

        test('Debe rechazar login con contraseña incorrecta', async () => {
            const credenciales = {
                correo: 'login@ejemplo.com',
                contraseña: 'PasswordIncorrecta123!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credenciales)
                .expect(400);

            expect(response.body.errors).toBeDefined();
        });

        test('Debe rechazar login con datos incompletos', async () => {
            const credencialesIncompletas = {
                correo: 'login@ejemplo.com'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credencialesIncompletas)
                .expect(400);

            expect(response.body.errors).toBeDefined();
            expect(Array.isArray(response.body.errors)).toBe(true);
        });

        test('Debe rechazar login de usuario inactivo', async () => {
            // Crear usuario inactivo
            const bcryptjs = require('bcryptjs');
            const salt = bcryptjs.genSaltSync(10);
            const contraseñaEncriptada = bcryptjs.hashSync('Password123!', salt);

            const usuarioInactivo = generarUsuarioCompleto({
                nombreUsuario: 'Usuario Inactivo',
                correo: 'inactivo@ejemplo.com',
                contraseña: contraseñaEncriptada,
                estado: false
            });

            await Usuario.create(usuarioInactivo);

            const credenciales = {
                correo: 'inactivo@ejemplo.com',
                contraseña: 'Password123!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credenciales)
                .expect(400);

            expect(response.body.errors).toBeDefined();
        });
    });

    describe('GET /api/auth/renovar', () => {
        
        let token;
        let usuario;

        beforeEach(async () => {
            // Registrar usuario y obtener token
            const nuevoUsuario = generarUsuarioCompleto({
                nombreUsuario: 'Usuario Token',
                correo: 'token@ejemplo.com'
            });

            const response = await request(app)
                .post('/api/auth/registro')
                .send(nuevoUsuario);

            token = response.body.token;
            usuario = response.body.usuario;
        });

        test('Debe renovar token válido correctamente', async () => {
            const response = await request(app)
                .get('/api/auth/renovar')
                .set('x-token', token)
                .expect(200);

            expect(response.body.usuario).toBeDefined();
            expect(response.body.usuario.uid).toBe(usuario.uid);
            expect(response.body.token).toBeDefined();
        });

        test('Debe rechazar request sin token', async () => {
            const response = await request(app)
                .get('/api/auth/renovar')
                .expect(401);

            expect(response.body.errors).toBeDefined();
        });

        test('Debe rechazar token inválido', async () => {
            const response = await request(app)
                .get('/api/auth/renovar')
                .set('x-token', 'token-invalido-123')
                .expect(401);

            expect(response.body.errors).toBeDefined();
        });
    });
});
