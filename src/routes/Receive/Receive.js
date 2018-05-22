import React, { Component } from 'react';
import { Divider, Button, Icon, Spin } from 'antd';
import * as QRCode from 'qrcode';
import { connect } from 'dva';
import styles from './Receive.less';
import Client from '../../utils/wallet-service/client';
import CopyToClipboard from '../../components/CopyToClipboard/CopyToClipboard';

class Receive extends Component {
  state = {
    userPublicKey: '',
    qrcode: '',
    loading: false,
    errorQRCode: false,
  };

  componentDidMount() {
    this.loadUrl();
  }

  loadUrl = async () => {
    this.setState({ loading: true });
    try {
      const userPublicKey = await Client.getPublicKey();
      const qrcode = await QRCode.toDataURL(userPublicKey);
      this.setState({ qrcode, userPublicKey, loading: false });
    } catch (error) {
      this.setState({ errorQRCode: error, loading: false });
    }
  };

  copyToClipBoard = () => {
    return (
      <CopyToClipboard text={this.state.address}>
        <Button type="default" size="small">
          <Icon type="copy" />
        </Button>
      </CopyToClipboard>
    );
  };

  render() {
    const { errorQRCode, loading } = this.state;
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderTitle}>Receive TRX</div>
        </div>
        <div className={styles.cardContent}>
          <p>Send TRX to the following address</p>
          <CopyToClipboard text={this.state.userPublicKey} />
          <Divider />
          <span>Or scan this QR code on a mobile device</span>
          {loading && <Spin size="medium" />}
          {errorQRCode && (
            <Button
              type="primary"
              size="large"
              icon="reload"
              onClick={() => this.loadUrl()}
            >Refresh QRCode
            </Button>)}
          {!loading && !errorQRCode && <img className={styles.qrcode} src={this.state.qrcode} alt="QRCode" />}
        </div>
      </div>
    );
  }
}

export default connect(({ user }) => ({
  userPublicKey: user.userWalletData.tronAccount,
}))(Receive);
