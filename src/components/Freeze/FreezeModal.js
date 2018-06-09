import React, { Component } from 'react';
import { Modal } from 'antd';
import styles from './FreezeModal.less';

class FreezeModal extends Component {
  state = {
    amount: '',
    terms: false,
  };

  onCheck = (e) => {
    const { checked } = e.target;
    this.setState({ terms: checked });
  };

  componentWilMount() {
    this.setState({ amount: undefined });
  }

  formatAmount = (number) => {
    return Number((number).toFixed(6)).toLocaleString();
  };

  amountIsValid = () => {
    const { amount } = this.state;
    const { balance } = this.props;
    return Number(amount) <= Number(balance);
  }

  render() {
    const { visible, onClose, onOk, balance } = this.props;
    const { amount, terms } = this.state;
    const footerButton = (
      <button
        className={styles.button}
        disabled={!terms || !this.amountIsValid()}
        onClick={() => onOk(amount)}
      >
        FREEZE BALANCE
      </button>
    );

    return (
      <Modal visible={visible} footer={footerButton} onCancel={onClose}>
        <h3>Freeze Balance</h3>
        <h3 className={styles.description}>TRX Amount({this.formatAmount(balance)})</h3>
        <input
          className={styles.formControl}
          onChange={e => this.setState({ amount: e.target.value })}
          value={amount}
          type="number"
          name="amount"
          id="amount"
        />
        {
          !this.amountIsValid() ?
            <small className={styles.trx}>You do not have enough TRX.</small> :
            null
        }
        <div className={styles.checkBoxContainer}>
          <input onChange={this.onCheck} type="checkbox" name="acceptTerms" checked={terms} />
          <span className={styles.checkboxText}>
            I confirm to freeze <b>{Number(amount || 0)} TRX</b> for at least of 3 days
          </span>
        </div>
      </Modal>
    );
  }
}

export default FreezeModal;
