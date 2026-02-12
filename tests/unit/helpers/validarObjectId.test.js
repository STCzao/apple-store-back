// Tests unitarios para validarObjectId helper
const { validarObjectId } = require('../../../helpers/validarObjectId');

describe('Helper: validarObjectId', () => {
    
    describe('Casos válidos', () => {
        test('Debe retornar true para un ObjectId válido', () => {
            const idValido = '507f1f77bcf86cd799439011';
            expect(validarObjectId(idValido)).toBe(true);
        });

        test('Debe retornar true para un ObjectId válido de 24 caracteres hex', () => {
            const idValido = '65a1b2c3d4e5f6789abcdef0';
            expect(validarObjectId(idValido)).toBe(true);
        });
    });

    describe('Casos inválidos', () => {
        test('Debe retornar false para un ID demasiado corto', () => {
            const idInvalido = '123';
            expect(validarObjectId(idInvalido)).toBe(false);
        });

        test('Debe retornar false para un ID con caracteres no hex', () => {
            const idInvalido = 'zzz1f77bcf86cd799439011';
            expect(validarObjectId(idInvalido)).toBe(false);
        });

        test('Debe retornar false para null', () => {
            expect(validarObjectId(null)).toBe(false);
        });

        test('Debe retornar false para undefined', () => {
            expect(validarObjectId(undefined)).toBe(false);
        });

        test('Debe retornar false para un string vacío', () => {
            expect(validarObjectId('')).toBe(false);
        });

        test('Debe retornar false para un número', () => {
            expect(validarObjectId(12345)).toBe(false);
        });

        test('Debe retornar false para un objeto', () => {
            expect(validarObjectId({ id: '123' })).toBe(false);
        });
    });
});
