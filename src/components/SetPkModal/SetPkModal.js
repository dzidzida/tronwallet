import React, { Component } from 'react';
import { Modal } from 'antd';
import { connect } from 'dva';
import logoAndroid from '../../assets/logo-android.svg';
import logoiOS from '../../assets/logo-ios.svg';
import styles from './SetPkModal.less';
import { setUserPk } from '../../services/api';
import { isAddressValid } from '../../utils/wallet-api-v2/utils/address';
import Client from '../../utils/wallet-service/client';

const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.tronmobile';
const IOS_URL = 'https://itunes.apple.com/us/app/tronvault/id1380161153?ls=1&mt=8';
class TransactionQRCode extends Component {
  state = {
    newPk: null,
    error: null,
    currentPk: null,
  };

  componentDidMount() {
    this.loadUserPk();
  }

  onCloseModal = () => {
    const { currentPk } = this.state;
    if (!currentPk) {
      this.setState({ error: 'You need to set a public key first' });
      return;
    }
    this.props.dispatch({
      type: 'monitor/changeModalPk',
      payload: { visible: false },
    });
  }

  putUser = async () => {
    const { newPk } = this.state;
    try {
      if (isAddressValid(newPk)) {
        await setUserPk(newPk);
        this.props.dispatch({
          type: 'user/fetchWalletData',
        });
        this.setState({ currentPk: newPk });
        this.onCloseModal();
      } else {
        throw new Error();
      }
    } catch (error) {
      this.setState({ error: 'Type a valid public key' });
    }
  };

  loadUserPk = async () => {
    const currentPk = await Client.getPublicKey();
    this.setState({ currentPk });
  }


  render() {
    const { visible } = this.props;
    const footerButton = (
      <button className={styles.button} onClick={this.putUser}>
        {'Ok'}
      </button>
    );

    return (
      <Modal visible={visible} footer={footerButton} onCancel={this.onCloseModal}>
        <h3>Configure Your TRON Account Address (public key)</h3>
        <br/>
        <input
          className={styles.formControl}
          onChange={e => this.setState({ newPk: e.target.value, error: null })}
          type="text"
          name="pk"
          id="pk"
          placeholder="Paste your public key here"
        />
        <h3 style={{ fontWeight: '700', color: 'red' }}>{this.state.error}</h3>
        <br/>
        <h3 style={{ textAlign: 'center' }}>You can create a new TRON account address using TronVault. Download now!</h3>
        <h3 style={{ textAlign: 'center' }}>Available for iOS and Android.</h3>
        <br/>
        <div className={styles.footerModal}>
          <a href={ANDROID_URL} target="_blank"><img src={logoAndroid} width="200" alt="android" /></a>
          <a href={IOS_URL} target="_blank"><img src={logoiOS} width="200" alt="ios" /></a>
        </div>
        <br/>
        <p className={styles.footerModal}>Available only for TRON Testnet.</p>
      </Modal>
    );
  }
}

export default connect()(TransactionQRCode);
