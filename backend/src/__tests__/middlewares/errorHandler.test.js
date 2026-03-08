const errorHandler = require('../../middlewares/errorHandler');
const ApiError = require('../../utils/ApiError');

// Mock res object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should handle ApiError with correct statusCode and message', () => {
    const err = ApiError.badRequest('Invalid data');
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, statusCode: 400, message: 'Invalid data' })
    );
  });

  it('should handle Prisma P2002 (unique constraint) → 409', () => {
    const err = { code: 'P2002', meta: { target: ['email'] }, message: 'Unique constraint' };
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 409 })
    );
  });

  it('should handle Prisma P2025 (record not found) → 404', () => {
    const err = { code: 'P2025', message: 'Record not found' };
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should default to 500 for unknown errors', () => {
    const err = new Error('Unknown');
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should include stack trace in development mode', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('Dev error');
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ stack: expect.any(String) })
    );
  });

  it('should NOT include stack in production', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('Prod error');
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.stack).toBeUndefined();
  });

  it('should include validation errors array if present', () => {
    const err = ApiError.badRequest('Validation', [{ field: 'email', message: 'required' }]);
    const res = mockRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ errors: [{ field: 'email', message: 'required' }] })
    );
  });
});
