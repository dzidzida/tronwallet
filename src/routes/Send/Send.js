import React from 'react';
import styles from './Send.less';

const Send = () => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardHeaderTitle}>Send TRX</h2>
      </div>
      <div className={styles.formContent}>
        <form className={styles.form}>
          <h3>To</h3>
          <input className={styles.formControl} type="text" name="to" id="to" />
          <h3>Token</h3>
          <div className={styles.selectWrapper}>
            <select className={styles.selectBox}>
              <option value="TRX">TRX (0 available)</option>
            </select>
          </div>
          <h3>Amount</h3>
          <input
            className={styles.formControl}
            type="number"
            name="amount"
            id="amount"
            placeholder="0.0000"
          />
          <div className={styles.messageContent}>
            <h2 className={styles.message}>
              Only enter valid TRON wallet address. Incorrect addresses can lead to TRX loss.
            </h2>
          </div>
          <button className={styles.button}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default Send;
