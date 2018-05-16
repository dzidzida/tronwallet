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

  putUser = async () => {
    const { pk } = this.state;
    const { onClose, loadData } = this.props;
    try {
      if (pk) {
        await setUserPk(pk);
        loadData();
        this.props.dispatch({
          type: 'user/fetchWalletData',
        });
        onClose();
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
