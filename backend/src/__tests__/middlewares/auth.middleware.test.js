// Mock dependencies trước khi require module
jest.mock('jsonwebtoken');
jest.mock('../../utils/prisma');
jest.mock('../../config/env', () => ({
  JWT_SECRET: 'test-secret',
}));

const jwt = require('jsonwebtoken');
const prisma = require('../../utils/prisma');
const ApiError = require('../../utils/ApiError');
const { authenticate, requireAdmin } = require('../../middlewares/auth');

// Helper: mock req, res, next
const mockReq = (overrides = {}) => ({
  cookies: {},
  headers: {},
  ...overrides,
});
const mockNext = () => jest.fn();

describe('authenticate middleware', () => {
  it('should throw 401 if no token provided', async () => {
    const req = mockReq();
    const next = mockNext();
    await authenticate(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('should extract token from cookie', async () => {
    const req = mockReq({ cookies: { hg_token: 'valid-token' } });
    const next = mockNext();

    jwt.verify.mockReturnValue({ id: 1, tokenVersion: 0 });
    prisma.users.findFirst.mockResolvedValue({
      id: 1, email: 'test@test.com', role: 'admin', is_active: true, full_name: 'Test', token_version: 0,
    });

    await authenticate(req, {}, next);
    expect(next).toHaveBeenCalledWith(); // no error
    expect(req.user).toEqual({ id: 1, email: 'test@test.com', role: 'admin', full_name: 'Test' });
  });

  it('should extract token from Authorization header', async () => {
    const req = mockReq({ headers: { authorization: 'Bearer my-token' } });
    const next = mockNext();

    jwt.verify.mockReturnValue({ id: 2, tokenVersion: 0 });
    prisma.users.findFirst.mockResolvedValue({
      id: 2, email: 'u@u.com', role: 'patient', is_active: true, full_name: 'User', token_version: 0,
    });

    await authenticate(req, {}, next);
    expect(jwt.verify).toHaveBeenCalledWith('my-token', 'test-secret');
    expect(next).toHaveBeenCalledWith();
  });

  it('should throw 401 if jwt.verify throws JsonWebTokenError', async () => {
    const req = mockReq({ cookies: { hg_token: 'bad-token' } });
    const next = mockNext();

    const jwtError = new Error('invalid');
    jwtError.name = 'JsonWebTokenError';
    jwt.verify.mockImplementation(() => { throw jwtError; });

    await authenticate(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('should throw 401 if jwt.verify throws TokenExpiredError', async () => {
    const req = mockReq({ cookies: { hg_token: 'expired-token' } });
    const next = mockNext();

    const expError = new Error('expired');
    expError.name = 'TokenExpiredError';
    jwt.verify.mockImplementation(() => { throw expError; });

    await authenticate(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('should throw 401 if user not found in DB', async () => {
    const req = mockReq({ cookies: { hg_token: 'token' } });
    const next = mockNext();

    jwt.verify.mockReturnValue({ id: 999 });
    prisma.users.findFirst.mockResolvedValue(null);

    await authenticate(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('should throw 423 if user is inactive', async () => {
    const req = mockReq({ cookies: { hg_token: 'token' } });
    const next = mockNext();

    jwt.verify.mockReturnValue({ id: 1 });
    prisma.users.findFirst.mockResolvedValue({
      id: 1, email: 'x@x.com', role: 'patient', is_active: false, full_name: 'X', token_version: 0,
    });

    await authenticate(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 423 }));
  });

  it('should throw 401 if token_version mismatch', async () => {
    const req = mockReq({ cookies: { hg_token: 'token' } });
    const next = mockNext();

    jwt.verify.mockReturnValue({ id: 1, tokenVersion: 0 });
    prisma.users.findFirst.mockResolvedValue({
      id: 1, email: 'x@x.com', role: 'patient', is_active: true, full_name: 'X', token_version: 5,
    });

    await authenticate(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});

describe('requireAdmin middleware', () => {
  it('should call next() if user is admin', () => {
    const req = { user: { role: 'admin' } };
    const next = mockNext();
    requireAdmin(req, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next(403) if user is not admin', () => {
    const req = { user: { role: 'patient' } };
    const next = mockNext();
    requireAdmin(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});
