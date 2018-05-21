import React, { Component } from 'react';
import { Modal } from 'antd';
import { connect } from 'dva';
import styles from './SetPkModal.less';
import { setUserPk } from '../../services/api';

class TransactionQRCode extends Component {
  state = {
    pk: null,
    error: null,
  };

  onCloseModal = () => {
    const { onClose } = this.props;
    this.props.dispatch({
      type: 'monitor/changePkModal',
      payload: { visible: false },
    });
    onClose();
  }
  putUser = async () => {
    const { pk } = this.state;
    try {
      if (pk) {
        await setUserPk(pk);
        this.props.dispatch({
          type: 'user/fetchWalletData',
        });
        this.onCloseModal();
      } else {
        throw new Error();
      }
    } catch (error) {
      this.setState({ error: 'Type a valid public key' });
    }
  };

  render() {
    const { visible, onClose } = this.props;
    const footerButton = (
      <button className={styles.button} onClick={this.putUser}>
        {'Ok'}
      </button>
    );

    return (
      <Modal visible={visible} footer={footerButton} onCancel={onClose}>
        <h3>Set your public key</h3>
        <input
          className={styles.formControl}
          onChange={e => this.setState({ pk: e.target.value })}
          type="text"
          name="pk"
          id="pk"
          placeholder="Insert your public key"
        />
        <h3 style={{ fontWeight: 'bold', color: 'red' }}>{this.state.error}</h3>
      </Modal>
    );
  }
}

export default connect()(TransactionQRCode);
