const ApiResponse = require('../../utils/ApiResponse');

// Helper: tạo mock res object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('ApiResponse', () => {
  describe('constructor', () => {
    it('should set success=true for status < 400', () => {
      const resp = new ApiResponse(200, { id: 1 }, 'OK');
      expect(resp.success).toBe(true);
      expect(resp.statusCode).toBe(200);
      expect(resp.message).toBe('OK');
      expect(resp.data).toEqual({ id: 1 });
    });

    it('should set success=false for status >= 400', () => {
      const resp = new ApiResponse(400, null, 'Error');
      expect(resp.success).toBe(false);
    });

    it('should use default values', () => {
      const resp = new ApiResponse(200);
      expect(resp.data).toBeNull();
      expect(resp.message).toBe('Success');
    });
  });

  describe('success()', () => {
    it('should respond with 200 and data', () => {
      const res = mockRes();
      ApiResponse.success(res, { name: 'test' }, 'Done');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, statusCode: 200, message: 'Done', data: { name: 'test' } })
      );
    });
  });

  describe('created()', () => {
    it('should respond with 201', () => {
      const res = mockRes();
      ApiResponse.created(res, { id: 1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, statusCode: 201 })
      );
    });
  });

  describe('noContent()', () => {
    it('should respond with 204 and no body', () => {
      const res = mockRes();
      ApiResponse.noContent(res);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('paginated()', () => {
    it('should respond with pagination metadata', () => {
      const res = mockRes();
      ApiResponse.paginated(res, [{ id: 1 }], 50, 1, 20);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [{ id: 1 }],
          pagination: { total: 50, page: 1, limit: 20, totalPages: 3 },
        })
      );
    });
  });
});
