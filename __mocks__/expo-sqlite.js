// Mock de expo-sqlite para jest (el módulo nativo no se resuelve en el runner).
// Adyacente a node_modules → jest lo aplica automáticamente. El `__mockDb`
// expuesto permite configurar getFirstAsync/runAsync por test.
const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue(undefined),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn().mockResolvedValue([]),
  withTransactionAsync: jest.fn(async (cb) => cb()),
};

module.exports = {
  openDatabaseAsync: jest.fn(async () => mockDb),
  __mockDb: mockDb,
};
