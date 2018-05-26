import React, { Component } from 'react';
import { Button } from 'antd';
import { connect } from 'dva';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';
import styles from './Send.less';
import Client from '../../utils/wallet-service/client';
import { isAddressValid } from '../../utils/wallet-api-v2/utils/address';

class Send extends Component {
  state = {
    to: null,
    amount: undefined,
    token: 'TRX',
    modalVisible: false,
    transactionData: null,
    error: null,
  };

  onCloseModal = () => {
    this.inputAmount.value = '';
    this.inputTo.value = '';
    this.setState({ modalVisible: false });
  };

  change = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  changeAmount = (e) => {
    const amount = e.target.value;
    this.setState({ amount });
  };

  isToValid = () => {
    const { to } = this.state;
    return to === null ? true : isAddressValid(to);
  };

  isAmountValid = () => {
    const { balances } = this.props.userWallet;
    if (balances && balances.length) {
      const { amount, token } = this.state;
      const currentToken = balances.find((elm) => {
        if (elm.name !== token) return false;
        return true;
      });

      if (currentToken && currentToken.balance) {
        const maxAmount = currentToken.balance;
        if (amount === undefined) return true;
        if (amount > 0 && amount <= maxAmount) return true;
        if (Number(amount) === 0 || amount === '') return false;
      }
      return false;
    }

    return true;
  };

  handleSend = async () => {
    const { amount, to, token } = this.state;
    this.setState({ loading: true });
    try {
      const transactionData = await Client.send({ to, token, amount });
      this.setState({ modalVisible: true, transactionData, loading: false });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  format = (number) => {
    return Number((number).toFixed(3)).toLocaleString();
  };

  renderOptions = () => {
    const { balances } = this.props.userWallet;
    const trxBalance = balances.find(bl => bl.name === 'TRX');
    return (
      <option key={trxBalance.name + trxBalance.balance} value={trxBalance.name}>
        {trxBalance.name} ({this.format(trxBalance.balance)} available)
      </option>
    );
  };

  render() {
    const { to, amount, modalVisible, error, transactionData, loading, token } = this.state;
    const { loadingWallet } = this.props;
    const { balances } = this.props.userWallet;
    const amountValid = this.isAmountValid();
    const toValid = this.isToValid();
    const canSend = toValid && amountValid && to !== null && amount > 0;
    const trx = balances.find(b => b.name === 'TRX');
    const trxBalance = trx ? trx.balance : 0;

    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardHeaderTitle}>Send TRX</h2>
        </div>
        <div className={styles.formContent}>
          <div className={styles.form}>
            <h3>To</h3>
            <input
              ref={(el) => { this.inputTo = el; }}
              className={[styles.formControl, toValid ? null : styles.invalidInput].join(' ')}
              onChange={this.change}
              type="text"
              name="to"
              id="to"
            />
            <div className={styles.invalid}>{!toValid && 'Put a valid address'}</div>
            <h3>Token</h3>
            <div className={styles.selectWrapper}>
              <select name="token" onChange={this.change} className={styles.selectBox}>
                {!loadingWallet && this.renderOptions()}
              </select>
            </div>
            <h3>Amount</h3>
            <input
              ref={(el) => { this.inputAmount = el; }}
              className={[styles.formControl, amountValid ? null : styles.invalidInput].join(' ')}
              onChange={this.changeAmount}
              type="text"
              name="amount"
              id="amount"
            />
            <div className={styles.invalid}>
              {!amountValid && 'Insufficient tokens or invalid amount'}
            </div>
            <div className={styles.messageContent}>
              <h2 className={styles.message}>
                Only enter valid TRON wallet address. Incorrect addresses can lead to TRX loss.
              </h2>
            </div>
            <h3 className={styles.messageError}>{error}</h3>
            <Button
              disabled={loadingWallet || !canSend || trxBalance === 0}
              type="primary"
              onClick={this.handleSend}
              className={[
                styles.button,
                !canSend || loadingWallet ? styles.disabled : null,
              ].join(' ')}
              icon="check-circle-o"
              loading={loadingWallet || loading}
            >
              {loadingWallet ? 'Loading data' : 'Send'}
            </Button>
          </div>
          <ModalTransaction
            title="Send TRX"
            message="Please, validate your transaction"
            txDetails={{ To: to, Token: token, Amount: amount, Type: 'SEND' }}
            data={transactionData}
            visible={modalVisible}
            onClose={this.onCloseModal}
          />
        </div>
      </div>
    );
  }
}

export default connect(({ user }) => ({
  loadingWallet: user.loadingWallet,
  userWallet: user.userWalletData,
}))(Send);
