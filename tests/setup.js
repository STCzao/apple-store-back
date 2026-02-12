// Setup para todos los tests
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno de .env.test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const mongoose = require('mongoose');

let mongoServer;

// Antes de todos los tests: iniciar MongoDB en memoria
beforeAll(async () => {
    // Intentar usar MongoMemoryServer si está disponible
    // (instalable con: npm install -D mongodb-memory-server)
    try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri);
        console.log(' Usando MongoDB Memory Server para tests');
    } catch (error) {
        // Fallback: usar conexión real de MongoDB
        // Por defecto, usar la misma conexión pero con sufijo -test
        const testDbUri = process.env.MONGODB_CNN_TEST || 
                         process.env.MONGODB_CNN?.replace(/\/[\w-]+(\?|$)/, '/$1-test$2') ||
                         'mongodb://localhost:27017/apple-store-test';
        
        await mongoose.connect(testDbUri);
        console.log(' Usando MongoDB real para tests:', testDbUri);
    }
});

// Después de cada test: limpiar las colecciones
// NOTA: Los tests E2E pueden desactivar esta limpieza estableciendo
// global.skipDbCleanup = true en su suite
afterEach(async () => {
    // No limpiar si es un test E2E que necesita mantener estado
    if (global.skipDbCleanup) {
        return;
    }
    
    if (mongoose.connection.readyState === 1) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
});

// Después de todos los tests: cerrar conexión
afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

// Aumentar timeout para operaciones de base de datos
jest.setTimeout(10000);
