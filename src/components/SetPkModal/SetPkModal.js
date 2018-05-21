import React, { Component } from 'react';
import { Modal } from 'antd';
import { connect } from 'dva';
import logoAndroid from '../../assets/logo-android.svg';
import logoiOS from '../../assets/logo-ios.svg';
import styles from './SetPkModal.less';
import { setUserPk } from '../../services/api';
import { isAddressValid } from '../../utils/wallet-api-v2/utils/address';
import Client from '../../utils/wallet-service/client';

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
        <h3>Set your public key</h3>
        <input
          className={styles.formControl}
          onChange={e => this.setState({ newPk: e.target.value, error: null })}
          type="text"
          name="pk"
          id="pk"
          placeholder="Insert your public key"
        />
        <h4 style={{ textAlign: 'center' }}>You can get your public key using Tron Vault</h4>
        <div className={styles.footerModal}>
          <img src={logoAndroid} width="150" alt="ios" />
          <img src={logoiOS} width="150" alt="android" />
        </div>
        <h3 style={{ fontWeight: 'bold', color: 'red' }}>{this.state.error}</h3>
      </Modal>
    );
  }
}

export default connect()(TransactionQRCode);
