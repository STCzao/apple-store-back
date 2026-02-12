# Testing Implementado - Primeros Pasos

## COMPLETADO: ¿Qué se ha implementado?

Se han implementado **94 tests automatizados** para el Apple Store Backend:

- **45 tests unitarios** (helpers)
- **33 tests de integración** (endpoints)
- **16 tests E2E** (flujos completos)

## Empezar AHORA

### Paso 1: Verificar Instalación

```bash
npm list jest supertest cross-env
```

Si falta alguna dependencia:
```bash
npm install
```

### Paso 2: Primera Ejecución (Opción Recomendada)

**Tests Unitarios** - RÁPIDO, no necesita DB compleja:

```bash
npm run test:unit
```

Esto ejecutará 45 tests de helpers en ~5-10 segundos.

### Paso 3: Si Quieres Ejecutar TODOS los Tests

Tienes 2 opciones para la base de datos:

#### Opción A: MongoDB Memory Server (RECOMENDADO)
```bash
# Instalar dependencia
npm install -D mongodb-memory-server

# Ejecutar todos los tests
npm test
```

#### Opción B: Usar tu MongoDB Local
```bash
# 1. Asegúrate que MongoDB está corriendo
# 2. Los tests usarán tu .env con la DB

# Ejecutar tests
npm test
```

## Comandos Disponibles

```bash
# Tests unitarios solamente (RÁPIDO)
npm run test:unit

# Tests de integración solamente
npm run test:integration

# Todos los tests
npm test

# Tests con reporte de cobertura
npm run test:coverage

# Modo watch (re-ejecuta al cambiar código)
npm run test:watch
```

## Qué Esperar

### Ejecución Exitosa
```bash
$ npm run test:unit

PASS tests/unit/helpers/validarObjectId.test.js
  V Debe retornar true para un ObjectId válido
  V Debe retornar false para un ID inválido
  ... 8 more tests

PASS tests/unit/helpers/validarStock.test.js
  V Debe retornar true cuando hay stock suficiente
  ... 16 more tests

PASS tests/unit/helpers/calcularTotalesCarrito.test.js
  V Debe calcular correctamente el total
  ... 17 more tests

Test Suites: 3 passed, 3 total
Tests:       45 passed, 45 total
Time:        5.234s
```

### Ver Cobertura de Código

```bash
npm run test:coverage
```

Abre el reporte en tu navegador:
```
coverage/index.html
```

Verás qué líneas de código están cubiertas por tests y cuáles no.

## Archivos Importantes

```
apple-store-backend/
├── jest.config.js                    # Configuración de Jest
├── .env.test                         # Variables para testing
├── TESTING.md                        # Guía rápida
├── IMPLEMENTACION_TESTING.md         # Resumen completo
│
└── tests/
    ├── setup.js                      # Setup global
    ├── sanity.test.js                # Test de verificación
    │
    ├── unit/                         # 45 tests
    │   └── helpers/
    │       ├── validarObjectId.test.js
    │       ├── validarStock.test.js
    │       └── calcularTotalesCarrito.test.js
    │
    ├── integration/                  # 33 tests
    │   ├── auth.test.js
    │   └── carrito.test.js
    │
    └── e2e/                          # 16 tests
        └── flujoCompra.test.js
```

## Troubleshooting

### Error: Cannot find module 'jest'
```bash
npm install
```

### Error: Cannot find module 'mongodb-memory-server'
Tienes 2 opciones:

1. Instalar MongoDB Memory Server (recomendado):
```bash
npm install -D mongodb-memory-server
```

2. O usar tu MongoDB local (ya está configurado para hacer fallback automático)

### Error: MONGODB_CNN not defined
El archivo `.env.test` ya está creado. Si falta alguna variable:
```bash
NODE_ENV=test
SECRETORPRIVATEKEY=test-secret-key
```

### Tests muy lentos
- Ejecuta solo tests unitarios: `npm run test:unit`
- Instala MongoDB Memory Server para tests más rápidos

## Próximos Pasos

1. **Ahora:** Ejecuta `npm run test:unit` para verificar
2. **Luego:** Ejecuta `npm test` para ver todos los tests
3. **Después:** Ejecuta `npm run test:coverage` para ver cobertura
4. **Finalmente:** Revisa `TESTING.md` para más detalles

## Documentación Completa

- `TESTING.md` - Guía rápida y comandos
- `IMPLEMENTACION_TESTING.md` - Resumen técnico completo
- `tests/README.md` - Estructura y estadísticas de tests

## Lo Que Esto Te Da

[OK] **Confianza** - Sabes que tu código funciona  
[OK] **Documentación** - Los tests muestran cómo usar cada función  
[OK] **Refactoring Seguro** - Cambia código sin miedo a romper cosas  
[OK] **Debugging Rápido** - Los tests indican exactamente qué falla  
[OK] **Profesionalismo** - Estándar de la industria  

---

## ACCIÓN INMEDIATA

Copia y pega esto en tu terminal:

```bash
npm run test:unit
```

Verás 45 tests pasar en verde.

---

**¿Preguntas?** Lee `TESTING.md` para más detalles.
