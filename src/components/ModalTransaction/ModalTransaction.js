import React, { Component, Fragment } from 'react';
import { Modal, Spin, Icon } from 'antd';
import * as QRCode from 'qrcode';
import { connect } from 'dva';
import QrReader from 'react-qr-reader';
import styles from './ModalTransaction.less';
import Client from '../../utils/wallet-service/client';
import TransactionDetails from './TransactionDetails';

const URL = 'https://notifier.tronwallet.me/validate';

const Header = ({ Text }) => (
  <div className={styles.messageContent}>
    <h2 className={styles.message}>{Text}</h2>
  </div>
);

class TransactionQRCode extends Component {
  state = {
    transactionQRCode: '',
    stage: 0,
    signedTransaction: {},
    loadingScreen: false,
    success: false,
    submitted: false,
    error: null,
  };


  componentWillReceiveProps(nextProps) {
    if (nextProps.data != null) {
      this.loadUrl(nextProps);
    }
  }


  onCloseModal = () => {
    const { success } = this.state;
    const { onClose } = this.props;
    if (success) {
      this.props.dispatch({
        type: 'user/fetchWalletData',
      });
    }
    this.setState({
      transactionQRCode: '',
      stage: 0,
      signedTransaction: {},
      loadingScreen: false,
      success: false,
      submitted: false,
      error: null,
    }, onClose());
  };


  loadUrl = async (nextProps) => {
    const { txDetails, data } = nextProps;
    const pk = await Client.getPublicKey();
    const validateData = JSON.stringify({
      txDetails,
      data,
      URL,
      pk,
      token: 'tron-wallet-getty',
    });
    // console.log('Sending this data', validateData);
    const transactionQRCode = await QRCode.toDataURL(validateData);
    this.setState({ transactionQRCode, stage: 0 });
  };

  goBack = () => this.setState({ stage: this.state.stage - 1 });

  handleScanTransaction = (data) => {
    if (data) {
      if (data.match(/^[0-9A-F]+$/g)) {
        this.handleGetTransactionDetails(data);
      } else {
        this.setState({ error: 'Invalid Transaction' });
      }
    }
  }

  handleGetTransactionDetails = async (signedTransaction) => {
    this.setState({ signedTransaction, loadingScreen: true });
    try {
      const transactionDetails = await Client.getTransactionDetails(signedTransaction);
      this.setState({ transactionDetails, loadingScreen: false, stage: 2 });
    } catch (error) {
      this.set({ error: error.message, loadingScreen: false });
    }
  }

  handleButtonClick = () => {
    const { stage } = this.state;
    this.setState({ stage: stage + 1, loadingScreen: true });
  }

  handleSubmitTransaction = async () => {
    const { signedTransaction } = this.state;
    let error = null;
    this.setState({ loadingScreen: true });
    try {
      const { success, code } = await Client.submitTransaction(signedTransaction);
      if (!success) error = code;
      this.setState({ success, error, loadingScreen: false, submitted: true });
    } catch (err) {
      this.setState({ error: err.message, loadingScreen: false, submitted: true });
    }
  }

  renderBody = () => {
    const { stage } = this.state;
    switch (stage) {
      case 0: return this.renderSignTransaction();
      case 1: return this.renderReaderQR();
      case 2: return this.renderSubmitTransaction();
      default: return this.renderSignTransaction();
    }
  }

  renderSignTransaction = () => {
    const { transactionQRCode, error } = this.state;
    return (
      <Fragment>
        <Header Text="Sign your transaction" />
        <img className={styles.qrcode} src={transactionQRCode} alt="Transaction QRCode" />
        <h3 style={{ alignSelf: 'center' }}>Use this QRCode to sign it</h3>
        <footer>
          <p className={styles.messageFail}>{error}</p>
          <button
            className={styles.button}
            onClick={() => this.setState({ stage: 1, error: null })}
          >
            Submit signed transaction
          </button>
        </footer>
      </Fragment>
    );
  }

  renderReaderQR = () => {
    const { error, loadingScreen } = this.state;
    return (
      <Fragment>
        <Header Text="Scan your Transaction" />
        {loadingScreen ? <Spin size="small" /> :
          (
            <Fragment>
              <QrReader
                delay={300}
                onError={() => this.setState({ error: 'Error while reading QRCode' })}
                onScan={this.handleScanTransaction}
                style={{ width: '80%', alignSelf: 'center' }}
              />
              <div style={{ marginTop: '20px' }}>
                <Icon onClick={this.goBack} style={{ fontSize: '3rem' }} type="arrow-left" />
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Back to signing</h3>
              </div>
              <p className={styles.messageFail}>{error}</p>
            </Fragment>
          )}
      </Fragment>
    );
  }

  renderSuccess = () => {
    const { success } = this.state;
    if (!success) return;
    return (
      <div className={styles.messageContentSuccess}>
        <p className={styles.messageSuccess}>Transaction submitted to network</p>
      </div>
    );
  }

  renderSubmitTransaction = () => {
    const { loadingScreen, transactionDetails, error, submitted } = this.state;
    return (
      <Fragment>
        <Header Text="Submit your transaction" />
        <TransactionDetails Details={transactionDetails} />
        {loadingScreen && <Spin size="small" />}
        <footer>
          {!loadingScreen && (
            <Fragment>
              <p className={styles.messageFail}>{error}</p>
              {submitted ? this.renderSuccess() : (
                <button
                  className={styles.button}
                  onClick={this.handleSubmitTransaction}
                >
                  Submit
                </button>
              )}
            </Fragment>
          )}
        </footer>
      </Fragment>
    );
  }


  render() {
    const { title, visible } = this.props;
    return (
      <Modal
        visible={visible}
        title={title}
        onCancel={this.onCloseModal}
        onOk={this.onCloseModal}
        footer={null}
      >
        <div className={styles.transaction}>
          {this.renderBody()}
        </div>
      </Modal>
    );
  }
}

export default connect()(TransactionQRCode);
