// Tests unitarios para validarStock helper
const { validarStock } = require('../../../helpers/validarStock');

describe('Helper: validarStock', () => {
    
    describe('Validaciones exitosas', () => {
        test('Debe retornar true cuando hay stock suficiente', () => {
            const producto = {
                nombre: 'iPhone 15',
                estado: true,
                inventario: 10
            };
            
            expect(validarStock(producto, 5)).toBe(true);
        });

        test('Debe retornar true cuando la cantidad exacta está disponible', () => {
            const producto = {
                nombre: 'MacBook Pro',
                estado: true,
                inventario: 3
            };
            
            expect(validarStock(producto, 3)).toBe(true);
        });

        test('Debe retornar true para cantidad 1 con inventario 1', () => {
            const producto = {
                nombre: 'iPad',
                estado: true,
                inventario: 1
            };
            
            expect(validarStock(producto, 1)).toBe(true);
        });
    });

    describe('Validación de producto inexistente', () => {
        test('Debe lanzar error si el producto es null', () => {
            expect(() => {
                validarStock(null, 5);
            }).toThrow('El producto no existe.');
        });

        test('Debe lanzar error si el producto es undefined', () => {
            expect(() => {
                validarStock(undefined, 5);
            }).toThrow('El producto no existe.');
        });
    });

    describe('Validación de producto inactivo', () => {
        test('Debe lanzar error si el producto está inactivo (estado = false)', () => {
            const producto = {
                nombre: 'Producto Descontinuado',
                estado: false,
                inventario: 10
            };
            
            expect(() => {
                validarStock(producto, 2);
            }).toThrow('El producto no está disponible.');
        });
    });

    describe('Validación de cantidad solicitada', () => {
        const producto = {
            nombre: 'AirPods',
            estado: true,
            inventario: 20
        };

        test('Debe lanzar error si la cantidad es 0', () => {
            expect(() => {
                validarStock(producto, 0);
            }).toThrow('La cantidad solicitada debe ser mayor a 0.');
        });

        test('Debe lanzar error si la cantidad es negativa', () => {
            expect(() => {
                validarStock(producto, -5);
            }).toThrow('La cantidad solicitada debe ser mayor a 0.');
        });

        test('Debe lanzar error si la cantidad es null', () => {
            expect(() => {
                validarStock(producto, null);
            }).toThrow('La cantidad solicitada debe ser mayor a 0.');
        });

        test('Debe lanzar error si la cantidad es undefined', () => {
            expect(() => {
                validarStock(producto, undefined);
            }).toThrow('La cantidad solicitada debe ser mayor a 0.');
        });
    });

    describe('Validación de inventario insuficiente', () => {
        test('Debe lanzar error si no hay suficiente inventario', () => {
            const producto = {
                nombre: 'Apple Watch',
                estado: true,
                inventario: 3
            };
            
            expect(() => {
                validarStock(producto, 5);
            }).toThrow(/Stock insuficiente/);
        });

        test('Debe mostrar cantidad disponible y solicitada en el error', () => {
            const producto = {
                nombre: 'HomePod',
                estado: true,
                inventario: 2
            };
            
            expect(() => {
                validarStock(producto, 10);
            }).toThrow('Stock insuficiente. Disponible: 2, Solicitado: 10');
        });

        test('Debe lanzar error cuando el inventario es 0', () => {
            const producto = {
                nombre: 'Producto Agotado',
                estado: true,
                inventario: 0
            };
            
            expect(() => {
                validarStock(producto, 1);
            }).toThrow(/Stock insuficiente/);
        });
    });
});
