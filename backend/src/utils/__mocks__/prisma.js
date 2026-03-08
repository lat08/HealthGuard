const { mockDeep, mockReset } = require('jest-mock-extended');

const prisma = mockDeep();

// Reset tất cả mocks trước mỗi test
beforeEach(() => {
  mockReset(prisma);
});

module.exports = prisma;
