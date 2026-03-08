const validate = require('../../middlewares/validate');

const mockReq = (body = {}, params = {}, query = {}) => ({ body, params, query });
const mockNext = () => jest.fn();

describe('validate middleware', () => {
  it('should call next() when all required fields are present', () => {
    const rules = { body: { email: { required: true, type: 'string' } } };
    const req = mockReq({ email: 'test@test.com' });
    const next = mockNext();

    validate(rules)(req, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should return error if required field is missing', () => {
    const rules = { body: { email: { required: true, type: 'string' } } };
    const req = mockReq({});
    const next = mockNext();

    validate(rules)(req, {}, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 })
    );
  });

  it('should return error if required field is empty string', () => {
    const rules = { body: { name: { required: true } } };
    const req = mockReq({ name: '' });
    const next = mockNext();

    validate(rules)(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it('should return error if type does not match', () => {
    const rules = { body: { age: { required: true, type: 'number' } } };
    const req = mockReq({ age: 'not a number' });
    const next = mockNext();

    validate(rules)(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it('should return error if value not in enum', () => {
    const rules = { body: { role: { required: true, enum: ['admin', 'user'] } } };
    const req = mockReq({ role: 'superadmin' });
    const next = mockNext();

    validate(rules)(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it('should return error if string is shorter than minLength', () => {
    const rules = { body: { password: { required: true, type: 'string', minLength: 8 } } };
    const req = mockReq({ password: '123' });
    const next = mockNext();

    validate(rules)(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it('should skip optional fields that are not provided', () => {
    const rules = { body: { nickname: { required: false, type: 'string' } } };
    const req = mockReq({});
    const next = mockNext();

    validate(rules)(req, {}, next);
    expect(next).toHaveBeenCalledWith(); // no error
  });

  it('should validate params and query sources', () => {
    const rules = {
      params: { id: { required: true, type: 'string' } },
      query: { page: { required: false, type: 'string' } },
    };
    const req = mockReq({}, { id: '123' }, { page: '1' });
    const next = mockNext();

    validate(rules)(req, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should collect multiple errors', () => {
    const rules = {
      body: {
        email: { required: true },
        name: { required: true },
      },
    };
    const req = mockReq({});
    const next = mockNext();

    validate(rules)(req, {}, next);
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
    expect(error.errors.length).toBe(2);
  });
});
