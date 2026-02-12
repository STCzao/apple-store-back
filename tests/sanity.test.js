// Test básico de verificación del entorno de testing
describe('Verificación del Entorno de Testing', () => {
    
    test('Jest está configurado correctamente', () => {
        expect(true).toBe(true);
    });

    test('Variables de entorno están disponibles', () => {
        expect(process.env.NODE_ENV).toBe('test');
        expect(process.env.SECRETORPRIVATEKEY).toBeDefined();
    });

    test('Mongoose está disponible', () => {
        const mongoose = require('mongoose');
        expect(mongoose).toBeDefined();
        expect(typeof mongoose.connect).toBe('function');
    });
});
