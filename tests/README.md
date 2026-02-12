# Tests del Apple Store Backend

## Estructura de Tests

```
tests/
├── e2e/                    # Tests End-to-End (flujos completos)
│   └── flujoCompra.test.js
├── integration/            # Tests de integración (endpoints)
│   ├── auth.test.js
│   └── carrito.test.js
├── unit/                   # Tests unitarios (funciones aisladas)
│   └── helpers/
│       ├── calcularTotalesCarrito.test.js
│       ├── validarObjectId.test.js
│       └── validarStock.test.js
├── fixtures/               # Datos de prueba reutilizables
│   ├── productos.js
│   └── usuarios.js
├── helpers/                # Utilidades para tests
│   ├── appHelper.js
│   └── testHelpers.js
└── setup.js               # Configuración global de tests
```

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage

# Ejecutar solo tests unitarios
npm run test:unit

# Ejecutar solo tests de integración
npm run test:integration
```

## Cobertura de Código

El proyecto está configurado con umbrales de cobertura mínima del 70%:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Después de ejecutar `npm run test:coverage`, abre `coverage/index.html` en tu navegador para ver el reporte detallado.

## Tests Implementados

### Tests Unitarios (Helpers)

✅ **validarObjectId**: 10 tests
- Validación de ObjectIds válidos
- Rechazo de IDs inválidos (cortos, caracteres no-hex, null, undefined)

✅ **validarStock**: 17 tests
- Validación de stock suficiente
- Rechazo de productos inexistentes o inactivos
- Validación de cantidades inválidas
- Mensajes de error descriptivos con cantidades disponibles

✅ **calcularTotalesCarrito**: 18 tests
- Cálculo correcto con uno y múltiples items
- Redondeo a 2 decimales
- Validación de carrito vacío
- Rechazo de parámetros inválidos
- Validación de precios y cantidades negativas

**Total: 45 tests unitarios**

### Tests de Integración (Endpoints)

✅ **Autenticación (/api/auth)**: 17 tests
- POST /registro: 6 tests (registro exitoso, validaciones, duplicados)
- POST /login: 5 tests (login exitoso, credenciales inválidas, usuario inactivo)
- GET /validar-token: 3 tests (validación de token, rechazo sin token)

✅ **Carrito (/api/carrito)**: 16 tests
- POST /item: 6 tests (agregar, incrementar, validación de stock)
- GET /: 3 tests (obtener carrito, autenticación)
- DELETE /item/:id: 3 tests (eliminar item, validaciones)
- PUT /item/:id: 4 tests (actualizar cantidad, validaciones)
- DELETE /: 2 tests (vaciar carrito)

**Total: 33 tests de integración**

### Tests E2E (Flujos Completos)

✅ **Flujo de Compra**: 16 tests
- Flujo exitoso: 8 pasos (registro → carrito → orden)
- Flujos de error: 3 tests (validaciones)
- Flujo de modificación: 4 pasos (agregar → eliminar → actualizar → comprar)

**Total: 16 tests E2E**

## TOTAL: 94 tests implementados

## Tecnologías

- **Jest**: Framework de testing
- **Supertest**: Testing de endpoints HTTP
- **MongoDB Memory Server**: Base de datos en memoria para tests (opcional)

## Notas Importantes

1. **Variables de Entorno**: Los tests usan `NODE_ENV=test` automáticamente
2. **Base de Datos**: Se limpia después de cada test para aislamiento
3. **Autenticación**: Los tests de integración y E2E generan tokens JWT reales
4. **Timeout**: 10 segundos por test (configurable en jest.config.js)
5. **Ejecución Serial**: Tests se ejecutan con `--runInBand` para evitar conflictos de DB

## Próximos Pasos

- [ ] Implementar tests para endpoints de productos
- [ ] Implementar tests para endpoints de categorías
- [ ] Implementar tests para endpoints de órdenes
- [ ] Implementar tests para endpoints de usuarios
- [ ] Agregar tests de performance
- [ ] Configurar CI/CD con GitHub Actions
