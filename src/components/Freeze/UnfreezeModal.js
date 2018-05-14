import React from 'react';
import { Modal } from 'antd';

const UnfreezeModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} onCancel={onClose}>
      <h3>Unfreeze Balance</h3>
      <span>Are you sure you want to unfreeze TRX?</span>
    </Modal>
  );
};

export default UnfreezeModal;
