// Fixtures de productos para testing
const productosFixture = {
    // Producto con stock suficiente
    productoDisponible: {
        nombreProducto: 'iPhone 15 Pro Max',
        precio: 1199.99,
        descripcion: 'Smartphone Apple con 256GB',
        stock: 50,
        estado: true
    },
    
    // Producto con stock bajo
    productoStockBajo: {
        nombreProducto: 'iPad Air',
        precio: 599.99,
        descripcion: 'Tablet Apple 10.9 pulgadas',
        stock: 3,
        estado: true
    },
    
    // Producto sin stock
    productoSinStock: {
        nombreProducto: 'MacBook Pro 16',
        precio: 2499.99,
        descripcion: 'Laptop profesional M3 Pro',
        stock: 0,
        estado: true
    },
    
    // Producto desactivado
    productoInactivo: {
        nombreProducto: 'iPhone 12',
        precio: 699.99,
        descripcion: 'Modelo anterior',
        stock: 10,
        estado: false
    }
};

module.exports = {
    productosFixture
};
