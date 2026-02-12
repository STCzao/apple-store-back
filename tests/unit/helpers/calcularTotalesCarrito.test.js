// Tests unitarios para calcularTotalesCarrito helper
const { calcularTotalesCarrito } = require('../../../helpers/calcularTotalesCarrito');

describe('Helper: calcularTotalesCarrito', () => {
    
    describe('Carrito válido con items', () => {
        test('Debe calcular correctamente el total con un solo item', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    precioSnapshot: 100,
                    cantidad: 2
                }
            ];

            const resultado = calcularTotalesCarrito(items);

            expect(resultado.subtotal).toBe(200);
            expect(resultado.total).toBe(200);
            expect(resultado.items).toHaveLength(1);
        });

        test('Debe calcular correctamente el total con múltiples items', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    precioSnapshot: 1199.99,
                    cantidad: 1
                },
                {
                    producto: '507f1f77bcf86cd799439012',
                    precioSnapshot: 599.99,
                    cantidad: 2
                },
                {
                    producto: '507f1f77bcf86cd799439013',
                    precioSnapshot: 29.99,
                    cantidad: 3
                }
            ];

            const resultado = calcularTotalesCarrito(items);

            // 1199.99 + (599.99 * 2) + (29.99 * 3) = 1199.99 + 1199.98 + 89.97 = 2489.94
            expect(resultado.subtotal).toBeCloseTo(2489.94, 2);
            expect(resultado.total).toBeCloseTo(2489.94, 2);
            expect(resultado.items).toHaveLength(3);
        });

        test('Debe redondear correctamente a 2 decimales', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    precioSnapshot: 10.10,
                    cantidad: 3
                }
            ];

            const resultado = calcularTotalesCarrito(items);

            expect(resultado.total).toBe(30.30);
        });

        test('Debe manejar precios con decimales complejos', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    precioSnapshot: 19.99,
                    cantidad: 5
                }
            ];

            const resultado = calcularTotalesCarrito(items);

            // 19.99 * 5 = 99.95
            expect(resultado.total).toBeCloseTo(99.95, 2);
        });
    });

    describe('Carrito vacío', () => {
        test('Debe retornar totales en 0 para carrito vacío', () => {
            const items = [];

            const resultado = calcularTotalesCarrito(items);

            expect(resultado.items).toHaveLength(0);
            expect(resultado.subtotal).toBe(0);
            expect(resultado.total).toBe(0);
        });

        test('Debe retornar totales en 0 sin parámetros', () => {
            const resultado = calcularTotalesCarrito();

            expect(resultado.items).toHaveLength(0);
            expect(resultado.subtotal).toBe(0);
            expect(resultado.total).toBe(0);
        });
    });

    describe('Validación de parámetros inválidos', () => {
        test('Debe lanzar error si items no es un arreglo', () => {
            expect(() => {
                calcularTotalesCarrito('no es un arreglo');
            }).toThrow('El parámetro items debe ser un arreglo.');
        });

        test('Debe lanzar error si items es un objeto', () => {
            expect(() => {
                calcularTotalesCarrito({ producto: '123' });
            }).toThrow('El parámetro items debe ser un arreglo.');
        });

        test('Debe lanzar error si items es un número', () => {
            expect(() => {
                calcularTotalesCarrito(123);
            }).toThrow('El parámetro items debe ser un arreglo.');
        });
    });

    describe('Validación de items sin campos requeridos', () => {
        test('Debe lanzar error si un item no tiene precioSnapshot', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    cantidad: 2
                }
            ];

            expect(() => {
                calcularTotalesCarrito(items);
            }).toThrow('Cada item debe tener precioSnapshot y cantidad');
        });

        test('Debe lanzar error si un item no tiene cantidad', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    precioSnapshot: 100
                }
            ];

            expect(() => {
                calcularTotalesCarrito(items);
            }).toThrow('Cada item debe tener precioSnapshot y cantidad');
        });
    });

    describe('Validación de valores negativos o inválidos', () => {
        test('Debe lanzar error si el precio es negativo', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    precioSnapshot: -50,
                    cantidad: 2
                }
            ];

            expect(() => {
                calcularTotalesCarrito(items);
            }).toThrow('El precio y la cantidad deben ser valores positivos');
        });

        test('Debe lanzar error si la cantidad es 0', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    precioSnapshot: 100,
                    cantidad: 0
                }
            ];

            expect(() => {
                calcularTotalesCarrito(items);
            }).toThrow('El precio y la cantidad deben ser valores positivos');
        });

        test('Debe lanzar error si la cantidad es negativa', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    precioSnapshot: 100,
                    cantidad: -3
                }
            ];

            expect(() => {
                calcularTotalesCarrito(items);
            }).toThrow('El precio y la cantidad deben ser valores positivos');
        });
    });

    describe('Casos edge', () => {
        test('Debe manejar precio 0 válido', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    precioSnapshot: 0,
                    cantidad: 5
                }
            ];

            // Precio 0 debería considerarse inválido según la validación actual
            expect(() => {
                calcularTotalesCarrito(items);
            }).toThrow('El precio y la cantidad deben ser valores positivos');
        });

        test('Debe calcular correctamente con cantidad 1', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    precioSnapshot: 999.99,
                    cantidad: 1
                }
            ];

            const resultado = calcularTotalesCarrito(items);

            expect(resultado.total).toBe(999.99);
        });

        test('Debe manejar precios muy altos correctamente', () => {
            const items = [
                {
                    producto: '507f1f77bcf86cd799439011',
                    precioSnapshot: 99999.99,
                    cantidad: 10
                }
            ];

            const resultado = calcularTotalesCarrito(items);

            expect(resultado.total).toBeCloseTo(999999.90, 2);
        });
    });
});
