import React, { Component } from 'react';
import { Divider, Button, Icon } from 'antd';
import * as QRCode from 'qrcode';
import CopyToClipboard from 'react-copy-to-clipboard';
import styles from './Receive.less';

class Receive extends Component {
  state = {
    address: '27cLJRHL9mb9fvAi4e7vUrArqGXSyafn4eN',
    qrcode: '',
  };

  componentDidMount() {
    this.loadUrl();
  }

  loadUrl = async () => {
    try {
      const qrcode = await QRCode.toDataURL(this.state.address);
      this.setState({ qrcode });
    } catch (error) {
      // console.log('>>>', error);
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
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderTitle}>Receive TRX</div>
        </div>
        <div className={styles.cardContent}>
          <p>Send TRX to the following address</p>
          <div className={styles.inputGroup}>
            <input
              className={styles.formControl}
              name="address"
              id="address"
              readOnly
              value={this.state.address}
            />
            <CopyToClipboard text={this.state.address}>
              <button className={styles.copyButton}>
                <Icon type="copy" />
              </button>
            </CopyToClipboard>
          </div>
          <Divider />
          <span>Or scan this QR code on a mobile device</span>
          <img src={this.state.qrcode} alt="QRCode" />
        </div>
      </div>
    );
  }
}

export default Receive;
