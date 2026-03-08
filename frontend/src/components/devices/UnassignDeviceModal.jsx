import ConfirmModal from '../ui/ConfirmModal';

const UnassignDeviceModal = ({ isOpen, onClose, device, onConfirm }) => {
  if (!device) return null;

  return (
    <ConfirmModal
      open={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant="danger"
      title="Bỏ gán thiết bị"
      message={
        <>
          Bạn có chắc chắn muốn bỏ gán thiết bị <span className="font-bold">"{device.device_name || 'Chưa đặt tên'}"</span> khỏi người dùng{' '}
          <span className="font-bold">{device.users?.full_name}</span>?
        </>
      }
      confirmText="Bỏ gán"
    />
  );
};

export default UnassignDeviceModal;
