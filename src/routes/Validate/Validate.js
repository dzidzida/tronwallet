import React, { Component } from 'react';
import axios from 'axios';
import Client from '../../utils/wallet-service/client';
import styles from './Validate.less';

export default class Transaction extends Component {
  state = {
    transaction: 'Waiting a transaction',
    result: null,
    error: null,
  };
  componentDidMount() {
    this.loadTransaction();
  }

  postResult = async (result, userpk) => {
    try {
      await axios.post('https://tronnotifier.now.sh/v1/notifier/emit', {
        uuid: userpk,
        succeeded: result,
      });
    } catch (err) {
      console.warn('err', err);
    } finally {
      setTimeout(() => {
        history.replaceState({}, '', '/#/user/');
      }, 8000);
    }
  };

  loadTransaction = async () => {
    const params = new URLSearchParams(this.props.location.search);
    const transaction = params.get('tx');
    const userpk = params.get('pk');
    let error = null;

    if (!userpk || !transaction) {
      this.setState({ error: 'Missing data, please try again' });
      return;
    }
    try {
      if (transaction) {
        const result = await Client.submitTransaction(transaction);
        this.postResult(!!result, userpk);

        if (!result) error = 'Transaction not successfull';

        this.setState({ result, error });
      } else {
        throw new Error();
      }
    } catch (err) {
      this.setState({ error: 'Something wrong while submiting' });
    }
  };

  render() {
    const { transaction, result, error } = this.state;
    return (
      <div className={styles.container}>
        <section>
          <strong>Sign submission page</strong>
        </section>
        <p>{transaction}</p>
        {result && <strong className={styles.success}> Transaction Succesfully Submited</strong>}
        {error && <strong className={styles.error}>{error}</strong>}
      </div>
    );
  }
}
