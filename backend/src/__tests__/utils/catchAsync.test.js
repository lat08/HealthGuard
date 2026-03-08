const catchAsync = require('../../utils/catchAsync');

describe('catchAsync', () => {
  const mockReq = {};
  const mockRes = {};

  it('should call the wrapped function with req, res, next', async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const next = jest.fn();

    const wrapped = catchAsync(fn);
    await wrapped(mockReq, mockRes, next);

    expect(fn).toHaveBeenCalledWith(mockReq, mockRes, next);
  });

  it('should NOT call next when function succeeds', async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const next = jest.fn();

    await catchAsync(fn)(mockReq, mockRes, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next(error) when function throws', async () => {
    const error = new Error('Something went wrong');
    const fn = jest.fn().mockRejectedValue(error);
    const next = jest.fn();

    await catchAsync(fn)(mockReq, mockRes, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
