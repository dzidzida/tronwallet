import React from 'react';
import { Modal } from 'antd';

const UnfreezeModal = ({ visible, onClose, onOk }) => {
  return (
    <Modal visible={visible} onCancel={onClose} onOk={onOk}>
      <h3>Unfreeze Balance</h3>
      <span>Are you sure you want to unfreeze TRX?</span>
    </Modal>
  );
};

export default UnfreezeModal;
