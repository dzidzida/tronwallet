import React, { Component } from 'react';
import { Modal } from 'antd';
import styles from './FreezeModal.less';

class FreezeModal extends Component {
  state = {
    amount: 0,
    terms: false,
  };

  onCheck = e => {
    const { checked } = e.target;
    this.setState({ terms: checked });
  };

  render() {
    const { visible, onClose } = this.props;
    const { amount, terms } = this.state;
    const footerButton = (
      <button className={styles.button} disabled={!terms} onClick={() => {}}>
        FREEZE BALANCE
      </button>
    );

    return (
      <Modal visible={visible} footer={footerButton} onCancel={onClose}>
        <h3>Freeze Balance</h3>
        <h3 className={styles.description}>TRX Amount</h3>
        <input
          className={styles.formControl}
          onChange={e => this.setState({ amount: e.target.value })}
          value={amount}
          type="number"
          name="amount"
          id="amount"
        />
        <div className={styles.checkBoxContainer}>
          <input onChange={this.onCheck} type="checkbox" name="acceptTerms" checked={terms} />
          <span className={styles.checkboxText}>
            I confirm to freeze <b>{amount} TRX</b> for at least of 3 days
          </span>
        </div>
      </Modal>
    );
  }
}

export default FreezeModal;
