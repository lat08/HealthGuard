// Mock Prisma trước khi import service
jest.mock('../../utils/prisma');

const prisma = require('../../utils/prisma');
const ApiError = require('../../utils/ApiError');
const deviceService = require('../../services/device.service');

describe('Device Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =======================================================
  // Test suite cho findAll()
  // =======================================================
  describe('findAll', () => {
    it('should return paginated devices list', async () => {
      const mockDevices = [
        {
          id: 1,
          uuid: 'device-uuid-1',
          device_name: 'Smartwatch 1',
          device_type: 'smartwatch',
          is_active: true,
          user_id: 1,
          users: { id: 1, full_name: 'John Doe', email: 'john@example.com' },
        },
      ];

      prisma.devices.findMany.mockResolvedValue(mockDevices);
      prisma.devices.count.mockResolvedValue(1);

      const result = await deviceService.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockDevices);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(prisma.devices.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deleted_at: null },
          skip: 0,
          take: 20,
        })
      );
    });

    it('should filter devices by is_active status', async () => {
      prisma.devices.findMany.mockResolvedValue([]);
      prisma.devices.count.mockResolvedValue(0);

      await deviceService.findAll({ is_active: true });

      expect(prisma.devices.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ is_active: true }),
        })
      );
    });

    it('should filter devices by has_owner', async () => {
      prisma.devices.findMany.mockResolvedValue([]);
      prisma.devices.count.mockResolvedValue(0);

      await deviceService.findAll({ has_owner: 'false' });

      expect(prisma.devices.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ user_id: null }),
        })
      );
    });

    it('should search devices by name, serial, or user', async () => {
      prisma.devices.findMany.mockResolvedValue([]);
      prisma.devices.count.mockResolvedValue(0);

      await deviceService.findAll({ search: 'test' });

      expect(prisma.devices.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { device_name: { contains: 'test', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });
  });

  // =======================================================
  // Test suite cho findById()
  // =======================================================
  describe('findById', () => {
    it('should throw 404 error if device not found', async () => {
      prisma.devices.findFirst.mockResolvedValue(null);

      await expect(deviceService.findById(999)).rejects.toThrow('Thiết bị không tồn tại');

      expect(prisma.devices.findFirst).toHaveBeenCalledWith({
        where: { id: 999, deleted_at: null },
        select: expect.any(Object),
      });
    });

    it('should return device successfully', async () => {
      const mockDevice = {
        id: 1,
        uuid: 'device-uuid-1',
        device_name: 'Smartwatch 1',
        is_active: true,
      };
      prisma.devices.findFirst.mockResolvedValue(mockDevice);

      const result = await deviceService.findById(1);

      expect(result).toEqual(mockDevice);
    });
  });

  // =======================================================
  // Test suite cho assignToUser()
  // =======================================================
  describe('assignToUser', () => {
    it('should throw error if device already has owner', async () => {
      const mockDevice = { id: 1, user_id: 2, device_name: 'Device 1' };
      prisma.devices.findFirst.mockResolvedValue(mockDevice);

      await expect(deviceService.assignToUser(1, 3, 1)).rejects.toThrow(
        'Thiết bị đã được gán cho người dùng khác'
      );
    });

    it('should throw error if user not found', async () => {
      const mockDevice = { id: 1, user_id: null, device_name: 'Device 1' };
      prisma.devices.findFirst
        .mockResolvedValueOnce(mockDevice) // findById
        .mockResolvedValueOnce(null); // user lookup

      await expect(deviceService.assignToUser(1, 999, 1)).rejects.toThrow(
        'Người dùng không tồn tại'
      );
    });

    it('should assign device to user successfully', async () => {
      const mockDevice = { id: 1, user_id: null, device_name: 'Device 1' };
      const mockUser = { id: 2, full_name: 'John Doe' };
      const updatedDevice = { ...mockDevice, user_id: 2 };

      // Mock findById (first call in assignToUser)
      prisma.devices.findFirst.mockResolvedValueOnce(mockDevice);
      
      // Mock user lookup (second call in assignToUser)
      prisma.users.findFirst.mockResolvedValueOnce(mockUser);
      
      prisma.devices.update.mockResolvedValue(updatedDevice);
      prisma.audit_logs.create.mockResolvedValue({});

      const result = await deviceService.assignToUser(1, 2, 1);

      expect(result.user_id).toBe(2);
      expect(prisma.devices.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({ user_id: 2 }),
        })
      );
      expect(prisma.audit_logs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'ASSIGN_DEVICE',
          }),
        })
      );
    });
  });

  // =======================================================
  // Test suite cho unassignFromUser()
  // =======================================================
  describe('unassignFromUser', () => {
    it('should throw error if device has no owner', async () => {
      const mockDevice = { id: 1, user_id: null, device_name: 'Device 1' };
      prisma.devices.findFirst.mockResolvedValue(mockDevice);

      await expect(deviceService.unassignFromUser(1, 1)).rejects.toThrow(
        'Thiết bị chưa được gán cho người dùng nào'
      );
    });

    it('should unassign device successfully', async () => {
      const mockDevice = {
        id: 1,
        user_id: 2,
        device_name: 'Device 1',
        users: { full_name: 'John Doe' },
      };
      const updatedDevice = { ...mockDevice, user_id: null };

      prisma.devices.findFirst.mockResolvedValue(mockDevice);
      prisma.devices.update.mockResolvedValue(updatedDevice);
      prisma.audit_logs.create.mockResolvedValue({});

      const result = await deviceService.unassignFromUser(1, 1);

      expect(result.user_id).toBeNull();
      expect(prisma.audit_logs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'UNASSIGN_DEVICE',
          }),
        })
      );
    });
  });

  // =======================================================
  // Test suite cho toggleLock()
  // =======================================================
  describe('toggleLock', () => {
    it('should lock active device', async () => {
      const mockDevice = { id: 1, is_active: true, device_name: 'Device 1' };
      const updatedDevice = { ...mockDevice, is_active: false };

      prisma.devices.findFirst.mockResolvedValue(mockDevice);
      prisma.devices.update.mockResolvedValue(updatedDevice);
      prisma.audit_logs.create.mockResolvedValue({});

      const result = await deviceService.toggleLock(1, 1);

      expect(result.is_active).toBe(false);
      expect(prisma.audit_logs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'LOCK_DEVICE',
          }),
        })
      );
    });

    it('should unlock inactive device', async () => {
      const mockDevice = { id: 1, is_active: false, device_name: 'Device 1' };
      const updatedDevice = { ...mockDevice, is_active: true };

      prisma.devices.findFirst.mockResolvedValue(mockDevice);
      prisma.devices.update.mockResolvedValue(updatedDevice);
      prisma.audit_logs.create.mockResolvedValue({});

      const result = await deviceService.toggleLock(1, 1);

      expect(result.is_active).toBe(true);
      expect(prisma.audit_logs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'UNLOCK_DEVICE',
          }),
        })
      );
    });
  });

  // =======================================================
  // Test suite cho update()
  // =======================================================
  describe('update', () => {
    it('should update device information', async () => {
      const mockDevice = { id: 1, device_name: 'Old Name' };
      const updateData = { device_name: 'New Name', model: 'Model X' };
      const updatedDevice = { ...mockDevice, ...updateData };

      prisma.devices.findFirst.mockResolvedValue(mockDevice);
      prisma.devices.update.mockResolvedValue(updatedDevice);
      prisma.audit_logs.create.mockResolvedValue({});

      const result = await deviceService.update(1, updateData, 1);

      expect(result.device_name).toBe('New Name');
      expect(prisma.devices.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            device_name: 'New Name',
            model: 'Model X',
          }),
        })
      );
    });
  });
});
