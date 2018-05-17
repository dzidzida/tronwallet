import React, { Component } from 'react';
import axios from 'axios';
import ValidateCodes from './ValidateCodes';
import Client from '../../utils/wallet-service/client';
import styles from './Validate.less';

export default class Transaction extends Component {
  state = {
    transaction: '',
    success: null,
    error: null,
  };
  componentDidMount() {
    this.loadTransaction();
  }

  postResult = async (success, userpk, transaction) => {
    try {
      await axios.post('https://tronnotifier.now.sh/v1/notifier/emit', {
        uuid: userpk,
        succeeded: success,
        hash: transaction,
      });
    } catch (err) {
      console.warn('err', err);
    } finally {
      // setTimeout(() => {
      //   history.replaceState({}, '', '/#/user/');
      // }, 8000);
    }
  };

  loadTransaction = async () => {
    const route = window.location.hash.split('/');
    const userpk = route[2];
    const transaction = route[3];
    // const time = route[4];

    let error = null;

    if (!userpk || !transaction) {
      this.setState({ error: 'Missing data, please try again' });
      return;
    }
    try {
      if (transaction) {
        const { success, code } = await Client.submitTransaction(transaction);
        this.postResult(success, userpk, transaction);
        if (!success) error = ValidateCodes[code] || code;

        this.setState({ success, error });
      } else {
        throw new Error();
      }
    } catch (err) {
      this.setState({ error: err.message });
    }
  };

  render() {
    const { transaction, success, error } = this.state;

    return (
      <div className={styles.container}>
        <section>
          <strong>Sign submission page</strong>
        </section>
        <p>{transaction}</p>
        {success && <strong className={styles.success}> Transaction Succesfully Submited</strong>}
        {error && <strong className={styles.error}>{error}</strong>}
      </div>
    );
  }
}
