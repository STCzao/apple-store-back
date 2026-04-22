// Set required env vars before any module loads
process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = "test-access-secret-key-for-jest";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key-for-jest";
process.env.JWT_ACCESS_EXPIRES = "15m";
process.env.JWT_REFRESH_EXPIRES = "7d";
process.env.RESEND_API_KEY = "re_test_dummy_key_for_jest";

const mongoose = require("mongoose");

let mongoServer;

beforeAll(async () => {
  const { MongoMemoryServer } = require("mongodb-memory-server");
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});

jest.setTimeout(15000);
