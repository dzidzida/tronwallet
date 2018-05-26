import React, { Component } from 'react';
import { Divider, Alert, Row, Col, Card, Button, Icon, Spin } from 'antd';
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
      <Row>
        <Col span={9}/>
        <Col span={6}>
          <Card title="Receive TRX"
                    style={{ marginBottom: 30 }}>

              <div className={styles.cardContent}>
                <p>Send TRX to the following address</p>
                <CopyToClipboard text={this.state.userPublicKey} />
                <Divider />
                <span>Or scan this QR code on a mobile device</span>
                {loading && <Spin size="small" />}
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
              <Alert
                message="Warning"
                description="This qrcode should only be scanned by TronWallet Mobile for iOS and Android. It wont will be recognized by TronVault. You can share your public key with your friends and clients, to receive and send TRX and TRON Tokens."
                type="warning"
                showIcon
              />
          </Card>
        </Col>
        <Col span={9}/>
      </Row>
    );
  }
}

export default connect(({ user }) => ({
  userPublicKey: user.userWalletData.tronAccount,
}))(Receive);
