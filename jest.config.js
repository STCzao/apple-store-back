module.exports = {
  testEnvironment: 'node',
  
  // Archivos de test
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Ignorar node_modules
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  // Cobertura de código (desactivada por defecto para velocidad)
  // Usar: npm run test:coverage para verla
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/config/'
  ],
  
  // Reportes de cobertura
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],
  
  // Umbrales de cobertura mínima (desactivados temporalmente)
  // Activar cuando tengamos más tests implementados
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // Variables de entorno para testing
  testEnvironment: 'node',
  
  // Setup DESPUÉS de cargar módulos (para MongoDB)
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Timeout para tests (útil para tests de integración)
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Ignorar advertencias de deprecación
  silent: false
};
