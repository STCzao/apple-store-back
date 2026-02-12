# Guía Rápida: Testing

## Instalación Completa (YA HECHO)

```bash
npm install --save-dev jest supertest cross-env
```

## Ejecutar Tests

### Opción 1: Tests Unitarios (RÁPIDO - recomendado para empezar)
```bash
npm run test:unit
```
Ejecuta solo los tests de helpers. Son rápidos y no necesitan base de datos compleja.

### Opción 2: Todos los Tests
```bash
npm test
```
Ejecuta unitarios + integración + E2E. Puede tardar más tiempo.

### Opción 3: Tests con Cobertura
```bash
npm run test:coverage
```
Genera reporte en `coverage/index.html`

### Opción 4: Modo Watch (Desarrollo)
```bash
npm run test:watch
```
Re-ejecuta tests automáticamente al hacer cambios.

## Primera Vez: Configuración de Base de Datos

Tienes 2 opciones:

### Opción A: MongoDB Memory Server (RECOMENDADO)
Base de datos en memoria - no necesita MongoDB instalado.

```bash
npm install -D mongodb-memory-server
```

Ventajas:
- No necesita MongoDB instalado
- Tests más rápidos
- Aislamiento total
- Se limpia automáticamente

### Opción B: MongoDB Real
Usa tu instancia de MongoDB local.

1. Crea archivo `.env.test`:
```env
NODE_ENV=test
MONGODB_CNN_TEST=mongodb://localhost:27017/apple-store-test
SECRETORPRIVATEKEY=test-secret-key
```

2. Asegúrate de que MongoDB está corriendo

Desventaja:
- Necesita MongoDB instalado y corriendo
- Más lento que Memory Server

## Estructura de Tests Implementados

```
tests/
├── unit/                   [45 tests] (Helpers)
│   └── helpers/
│       ├── validarObjectId.test.js      (10 tests)
│       ├── validarStock.test.js         (17 tests)
│       └── calcularTotalesCarrito.test.js (18 tests)
│
├── integration/            [33 tests] (Endpoints)
│   ├── auth.test.js                     (17 tests)
│   └── carrito.test.js                  (16 tests)
│
└── e2e/                    [16 tests] (Flujos completos)
    └── flujoCompra.test.js              (16 tests)

TOTAL: 94 tests
```

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm test` | Ejecuta todos los tests |
| `npm run test:unit` | Solo tests unitarios |
| `npm run test:integration` | Solo tests de integración |
| `npm run test:coverage` | Tests + reporte de cobertura |
| `npm run test:watch` | Modo watch (re-ejecuta al cambiar código) |

## Interpretando Resultados

### Tests Exitosos
```
PASS tests/unit/helpers/validarObjectId.test.js
V Debe retornar true para un ObjectId válido (5ms)
V Debe retornar false para un ID inválido (2ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

### Tests Fallidos
```
FAIL tests/unit/helpers/validarStock.test.js
X Debe validar stock suficiente (15ms)

Expected: true
Received: false

Test Suites: 1 failed, 1 total
Tests:       1 failed, 9 passed, 10 total
```

## Reporte de Cobertura

Después de ejecutar `npm run test:coverage`:

```
-----------------|---------|----------|---------|---------|
File             | % Stmts | % Branch | % Funcs | % Lines |
-----------------|---------|----------|---------|---------|
All files        |   87.5  |   85.2   |   90.1  |   87.3  |
helpers/         |   95.2  |   92.8   |   100   |   95.0  |
controllers/     |   82.1  |   78.4   |   85.2  |   82.0  |
services/        |   88.3  |   86.1   |   91.5  |   88.2  |
-----------------|---------|----------|---------|---------|
```

Abre `coverage/index.html` para ver líneas exactas cubiertas/no cubiertas.

## Troubleshooting

### Error: Cannot find module 'mongodb-memory-server'
Instalar:
```bash
npm install -D mongodb-memory-server
```

O usar MongoDB real (ver Opción B arriba).

### Error: MONGODB_CNN not defined
Crear archivo `.env.test` con las variables necesarias.

### Tests muy lentos
- Usar MongoDB Memory Server (más rápido)
- Ejecutar solo tests unitarios: `npm run test:unit`

### Error: Port already in use
Los tests no levantan servidor en puerto real, esto no debería pasar.
Si ocurre, verificar que no haya otra instancia corriendo.

## Próximos Pasos

1. [OK] Tests unitarios implementados (45 tests)
2. [OK] Tests de integración implementados (33 tests)
3. [OK] Tests E2E implementados (16 tests)
4. [PENDIENTE] Aumentar cobertura a 80%+
5. [PENDIENTE] Tests para productos, categorías, órdenes, usuarios
6. [PENDIENTE] CI/CD con GitHub Actions

## Recursos

- [Documentación de Jest](https://jestjs.io/)
- [Documentación de Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
