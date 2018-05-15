import React, { Component } from 'react';
import { Modal } from 'antd';
import * as QRCode from 'qrcode';
import openSocket from 'socket.io-client';
import styles from './ModalTransaction.less';
import Client from '../../utils/wallet-service/client';

const URL = 'http://192.168.0.7:8000/#/user/validate';
const URL_SOCKET = 'https://tronnotifier.now.sh';

class TransactionQRCode extends Component {
  state = {
    qrcode: null,
    transactionResult: null,
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
    this.setState({ transactionResult: null, qrcode: null }, onClose());
  };

  openSocket = async () => {
    const pk = await Client.getPublicKey();
    this.socket = openSocket(URL_SOCKET);
    this.socket.on('payback', data => {
      if (data.uuid === pk) {
        this.setState({ transactionResult: data.succeeded }, this.onCloseModal());
      }
    });
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

  renderTransactionDetails = () => {
    const { txDetails } = this.props;
    const details = [];
    for (const detail in txDetails) {
      if (detail) {
        details.push(
          <h3 key={detail}>
            {detail}: <strong>{txDetails[detail]}</strong>
          </h3>
        );
      }
    }
    return details;
  };

  renderAfterResult = () => {
    const { transactionResult } = this.state;
    const styleMsg = transactionResult
      ? [styles.messageContentSuccess, styles.messageSuccess]
      : [styles.messageContentFail, styles.messageFail];
    return (
      <>
        <div className={styleMsg[0]}>
          <p className={styleMsg[1]}>
            Your transaction was {transactionResult ? 'successful' : 'not successful'}
          </p>
        </div>
        <div className={styles.transactionResult}>{this.renderTransactionDetails()}</div>
      </>
    );
  };
  renderBeforeResult = () => {
    const { message } = this.props;
    const { qrcode } = this.state;
    return (
      <>
        <div className={styles.messageContent}>
          <h2 className={styles.message}> {message}</h2>
        </div>
        <img className={styles.qrcode} src={qrcode} alt="Transaction QRCode" />
        <h3>Use this QRCode to validate it</h3>
      </>
    );
  };

  render() {
    const { title, visible, textFooter } = this.props;
    const { transactionResult } = this.state;

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
          {transactionResult === null ? this.renderBeforeResult() : this.renderAfterResult()}
        </div>
      </Modal>
    );
  }
}

export default TransactionQRCode;
