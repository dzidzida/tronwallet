import React, { Component } from 'react';
import { Modal } from 'antd';
import styles from './TransactionResultModal.less';

class TransactionQRCode extends Component {
  render() {
    const { visible, onClose, result } = this.props;
    const footerButton = (
      <button className={styles.button} onClick={onClose}>
        {'Ok'}
      </button>
    );
    return (
      <Modal
        visible={visible}
        title="Last transaction"
        onCancel={onClose}
        onOk={onClose}
        footer={footerButton}
      >
        <h2>
          Your last transaction was
          {result ? (
            <strong className={styles.success}> successful</strong>
          ) : (
            <strong className={styles.fail}> not successful</strong>
          )}
        </h2>
      </Modal>
    );
  }
}

export default TransactionQRCode;
