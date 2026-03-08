const ApiError = require('../../utils/ApiError');

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create an error with statusCode, message and errors', () => {
      const error = new ApiError(400, 'Bad request', [{ field: 'email' }]);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.errors).toEqual([{ field: 'email' }]);
      expect(error.isOperational).toBe(true);
    });

    it('should default errors to empty array', () => {
      const error = new ApiError(500, 'Internal');
      expect(error.errors).toEqual([]);
    });
  });

  describe('factory methods', () => {
    it('badRequest — 400', () => {
      const err = ApiError.badRequest('Invalid input');
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Invalid input');
    });

    it('badRequest — default message', () => {
      const err = ApiError.badRequest();
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Yêu cầu không hợp lệ');
    });

    it('badRequest — with validation errors', () => {
      const errors = [{ field: 'email', message: 'required' }];
      const err = ApiError.badRequest('Validation failed', errors);
      expect(err.errors).toEqual(errors);
    });

    it('unauthorized — 401', () => {
      const err = ApiError.unauthorized('Not logged in');
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('Not logged in');
    });

    it('unauthorized — default message', () => {
      const err = ApiError.unauthorized();
      expect(err.message).toBe('Chưa xác thực');
    });

    it('forbidden — 403', () => {
      const err = ApiError.forbidden('No access');
      expect(err.statusCode).toBe(403);
    });

    it('notFound — 404', () => {
      const err = ApiError.notFound('Not found');
      expect(err.statusCode).toBe(404);
    });

    it('conflict — 409', () => {
      const err = ApiError.conflict('Duplicate');
      expect(err.statusCode).toBe(409);
    });

    it('locked — 423', () => {
      const err = ApiError.locked('Account locked');
      expect(err.statusCode).toBe(423);
    });

    it('internal — 500', () => {
      const err = ApiError.internal('Server error');
      expect(err.statusCode).toBe(500);
    });
  });
});
