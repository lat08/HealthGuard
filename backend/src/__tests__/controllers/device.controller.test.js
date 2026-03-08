jest.mock('../../services/device.service');

const deviceService = require('../../services/device.service');
const deviceController = require('../../controllers/device.controller');

describe('Device Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      user: { id: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated devices list', async () => {
      const mockResult = {
        data: [{ id: 1, device_name: 'Device 1' }],
        total: 1,
        page: 1,
        limit: 20,
      };

      deviceService.findAll.mockResolvedValue(mockResult);
      req.query = { page: '1', limit: '20' };

      await deviceController.getAll(req, res, next);

      expect(deviceService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        is_active: undefined,
        has_owner: undefined,
        search: undefined,
        device_type: undefined,
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockResult.data,
        })
      );
    });
  });

  describe('getById', () => {
    it('should return device by id', async () => {
      const mockDevice = { id: 1, device_name: 'Device 1' };
      deviceService.findById.mockResolvedValue(mockDevice);
      req.params.id = '1';

      await deviceController.getById(req, res, next);

      expect(deviceService.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockDevice,
        })
      );
    });
  });

  describe('assignToUser', () => {
    it('should assign device to user', async () => {
      const mockDevice = { id: 1, user_id: 2 };
      deviceService.assignToUser.mockResolvedValue(mockDevice);
      req.params.id = '1';
      req.body.userId = 2;

      await deviceController.assignToUser(req, res, next);

      expect(deviceService.assignToUser).toHaveBeenCalledWith('1', 2, 1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockDevice,
        })
      );
    });
  });

  describe('unassignFromUser', () => {
    it('should unassign device from user', async () => {
      const mockDevice = { id: 1, user_id: null };
      deviceService.unassignFromUser.mockResolvedValue(mockDevice);
      req.params.id = '1';

      await deviceController.unassignFromUser(req, res, next);

      expect(deviceService.unassignFromUser).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockDevice,
        })
      );
    });
  });

  describe('toggleLock', () => {
    it('should toggle device lock status', async () => {
      const mockDevice = { id: 1, is_active: false };
      deviceService.toggleLock.mockResolvedValue(mockDevice);
      req.params.id = '1';

      await deviceController.toggleLock(req, res, next);

      expect(deviceService.toggleLock).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockDevice,
          message: 'Đã khóa thiết bị',
        })
      );
    });
  });

  describe('update', () => {
    it('should update device information', async () => {
      const mockDevice = { id: 1, device_name: 'Updated Device' };
      const updateData = { device_name: 'Updated Device' };
      deviceService.update.mockResolvedValue(mockDevice);
      req.params.id = '1';
      req.body = updateData;

      await deviceController.update(req, res, next);

      expect(deviceService.update).toHaveBeenCalledWith('1', updateData, 1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockDevice,
        })
      );
    });
  });
});
