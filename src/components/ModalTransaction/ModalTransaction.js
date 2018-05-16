import React, { Component } from 'react';
import { Modal } from 'antd';
import * as QRCode from 'qrcode';
import styles from './ModalTransaction.less';
import Client from '../../utils/wallet-service/client';

const URL = 'https://guard.tronwallet.me/#/user/validate';

class TransactionQRCode extends Component {
  state = {
    qrcode: null,
  };


  componentWillReceiveProps(nextProps) {
    if (nextProps.data != null) {
      this.loadUrl(nextProps.data);
    }
  }

  onCloseModal = () => {
    const { onClose } = this.props; // onClose From Parent component
    this.setState({ qrcode: null }, onClose());
  };


  loadUrl = async (data = 'getty.io') => {
    const { txDetails } = this.props;
    const pk = await Client.getPublicKey();
    const validateData = JSON.stringify({
      txDetails,
      data,
      URL,
      pk,
      token: 'tron-wallet-getty',
    });
    console.log('Sending this data', validateData);
    const qrcode = await QRCode.toDataURL(validateData);
    this.setState({ qrcode });
  };

  render() {
    const { title, visible, textFooter, message } = this.props;
    const { qrcode } = this.state;
    const footerButton = (
      <button className={styles.button} onClick={this.onCloseModal}>
        {textFooter || 'Make another Transaction'}
      </button>
    );

    return (
      <Modal
        visible={visible}
        title={title}
        onCancel={this.onCloseModal}
        onOk={this.onCloseModal}
        footer={footerButton}
      >
        <div className={styles.transaction}>
          <div className={styles.messageContent}>
            <h2 className={styles.message}> {message}</h2>
          </div>
          <img className={styles.qrcode} src={qrcode} alt="Transaction QRCode" />
          <h3>Use this QRCode to validate it</h3>
        </div>
      </Modal>
    );
  }
}

export default TransactionQRCode;
