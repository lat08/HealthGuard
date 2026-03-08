import ConfirmModal from '../ui/ConfirmModal';

const LockDeviceModal = ({ isOpen, onClose, device, onConfirm }) => {
  if (!device) return null;

  const isLocking = device.is_active;

  return (
    <ConfirmModal
      open={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant={isLocking ? 'warning' : 'success'}
      title={isLocking ? 'Khóa thiết bị' : 'Mở khóa thiết bị'}
      message={
        isLocking
          ? `Bạn có chắc chắn muốn khóa thiết bị "${device.device_name || 'Chưa đặt tên'}"? Thiết bị sẽ ngừng nhận dữ liệu.`
          : `Bạn có chắc chắn muốn mở khóa thiết bị "${device.device_name || 'Chưa đặt tên'}"?`
      }
      confirmText={isLocking ? 'Khóa thiết bị' : 'Mở khóa'}
    />
  );
};

export default LockDeviceModal;
