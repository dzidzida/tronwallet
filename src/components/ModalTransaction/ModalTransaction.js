import React, { Component } from 'react';
import { Modal } from 'antd';
import * as QRCode from 'qrcode';
import styles from './ModalTransaction.less';

class TransactionQRCode extends Component {
  state = {
    qrcode: null,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.data != null) {
      this.loadUrl(nextProps.data);
    }
  }

  loadUrl = async (data = 'getty.io') => {
    const qrcode = await QRCode.toDataURL(data);
    this.setState({ qrcode });
  };
  render() {
    const { title, message, visible, onClose, textFooter } = this.props;
    const { qrcode } = this.state;

    const footerButton = (
      <button className={styles.button} onClick={onClose}>
        {textFooter || 'Make another Transaction'}
      </button>
    );

    return (
      <Modal
        visible={visible}
        title={title}
        onCancel={onClose}
        onOk={onClose}
        footer={footerButton}
      >
        <div className={styles.transaction}>
          <div className={styles.messageContentSuccess}>
            <h2 className={styles.messageSuccess}> {message}</h2>
          </div>
          <img className={styles.qrcode} src={qrcode} alt="Transaction QRCode" />
          <h3>You can check the transaction using this QRCode</h3>
        </div>
      </Modal>
    );
  }
}

export default TransactionQRCode;
