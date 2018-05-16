import React, { Component } from 'react';
import { Modal } from 'antd';
import * as QRCode from 'qrcode';
import openSocket from 'socket.io-client';
import styles from './ModalTransaction.less';
import Client from '../../utils/wallet-service/client';

const URL_SOCKET = 'https://tronnotifier.now.sh';
const URL = 'https://secure.tronwallet.me/#/validate';

class TransactionQRCode extends Component {
  state = {
    qrcode: null,
  };

  componentDidMount() {
    this.openSocket();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data != null) {
      this.loadUrl(nextProps.data);
    }
  }
  componentWillUnmount() {
    if (this.socket) {
      this.socket.close();
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

  openSocket = async () => {
    const pk = await Client.getPublicKey();
    this.socket = openSocket(URL_SOCKET);
    this.socket.on('payback', data => {
      if (data.uuid === pk) {
        // this.setState({ transactionResult: data.succeeded }, this.onCloseModal());
        this.onCloseModal();
      }
    });
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
