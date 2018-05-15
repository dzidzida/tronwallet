import React, { Component } from 'react';
import { Modal } from 'antd';
import * as QRCode from 'qrcode';
import styles from './ModalTransaction.less';
import { getUserAttributes } from '../../services/api';

const URL = 'http://192.168.0.7:8000/#/user/validate';

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
    const { txDetails } = this.props;
    const user = await getUserAttributes();
    const validateData = JSON.stringify({
      txDetails,
      data,
      URL,
      pk: user['custom:publickey'],
      token: 'tron-wallet-getty',
    });
    console.log('Sending this data', validateData);
    const qrcode = await QRCode.toDataURL(validateData);
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
          <div className={styles.messageContentWarning}>
            <h2 className={styles.messageWarning}> {message}</h2>
          </div>
          <img className={styles.qrcode} src={qrcode} alt="Transaction QRCode" />
          <h3>Use this QRCode to validate it</h3>
        </div>
      </Modal>
    );
  }
}

export default TransactionQRCode;
