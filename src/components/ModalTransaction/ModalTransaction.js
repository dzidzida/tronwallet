import React, { Component, Fragment } from 'react';
import { Modal, Spin, Icon, Button, message, Alert } from 'antd';
import * as QRCode from 'qrcode';
import { connect } from 'dva';
import QrReader from 'react-qr-reader';
import styles from './ModalTransaction.less';
import Client from '../../utils/wallet-service/client';
import TransactionDetails from './TransactionDetails';


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
    const { onClose, onSuccess } = this.props;
    if (success) {
      this.props.dispatch({
        type: 'user/fetchWalletData',
      });
      message.success(onSuccess, 5);
    }
    onClose();
    setTimeout(() => {
      this.setState({
        transactionQRCode: '',
        stage: 0,
        signedTransaction: {},
        loadingScreen: false,
        success: false,
        submitted: false,
        error: null,
      });
    }, 1000);
  };


  loadUrl = async (nextProps) => {
    const { txDetails, data } = nextProps;
    const pk = await Client.getPublicKey();
    const validateData = JSON.stringify({
      txDetails,
      data,
      URL: '',
      pk,
      token: 'tron-wallet-getty',
    });

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
      const { success, message } = await Client.submitTransaction(signedTransaction);
      if (!success) error = message;
      this.setState({ success, error, loadingScreen: false, submitted: true });
    } catch (err) {
      this.setState({ error: message, loadingScreen: false, submitted: true });
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
        <img className={styles.qrcode} src={transactionQRCode} alt="Transaction QRCode" />
        <h3 style={{ alignSelf: 'left' }}>Please, follow the steps below:</h3>
        <h5 style={{ alignSelf: 'left' }}>1. Use the QRCode above to sign your transaction with TronVault.</h5>
        <h5 style={{ alignSelf: 'left' }}>2. Add a contract in TronVault.</h5>
        <h5 style={{ alignSelf: 'left' }}>3. Scan the QRCode and sign the transaction on TronVault.</h5>
        <h5 style={{ alignSelf: 'left' }}>4. Click on the button "Scan and submit transaction" on TronWallet to scan the result QRCode from TronVault.</h5>
        <h5 style={{ alignSelf: 'left' }}>5. TronWallet will ask to enable the camera on your desktop to verify the transaction data.</h5>
        <h5 style={{ alignSelf: 'left' }}>6. The the button "Submit" will appear, click on it to send your transaction to the network.</h5>
        <footer style={{ alignSelf: 'center' }}>
          <p className={styles.messageFail}>{error}</p>
          <Button
            icon="scan"
            type="primary"
            size="large"
            onClick={() => this.setState({ stage: 1, error: null })}
          >
            Scan and submit transaction
          </Button>
        </footer>
      </Fragment>
    );
  }

  renderReaderQR = () => {
    const { error, loadingScreen } = this.state;
    return (
      <Fragment>
        {loadingScreen ? <Spin size="small" /> :
          (
            <Fragment>
              <QrReader
                delay={300}
                onError={() => this.setState({ error: 'Error while reading QRCode' })}
                onScan={this.handleScanTransaction}
                style={{ width: '110%', alignSelf: 'center' }}
              />
              <p className={styles.messageFail}>{error}</p>
              <Alert
                message="Notice"
                description="Some users have reported problems to show the qrcode to the pc or notebook camera. Please, show the signed qrcode in TronVault with your phone in landscape mode."
                type="info"
                showIcon
              />
              <br />
              <Button type="danger" size="large" onClick={this.goBack} style={{ alignSelf: 'center' }} ghost>
                <Icon type="arrow-left" />Back
              </Button>
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
          {(!loadingScreen && !error) && (
            <Fragment>
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
          <p className={styles.messageFail}>{error}</p>
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
