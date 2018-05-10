import React from 'react';
import styles from './Account.less';

const Account = () => {
  return (
    <div>
      <div className={styles.dangerMessage}>
        Do not send TRX from your own wallet or exchange to your testnet address!
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardHeaderTitle}>Account</h2>
        </div>
        <div className={styles.formContent}>
          <div className={styles.row}>
            <div className={styles.space}>
              <h3 className={styles.simpleText}>
                <b>Address</b>
              </h3>
            </div>
            <div className={styles.column}>
              <h3 className={styles.simpleText}>27TpkW7nWVLtCmGW3dr32m3XbFofsqLWZom</h3>
              <h3 className={styles.danger}>
                (Do not send TRX from your own wallet or exchange to the above account address of
                testnet!)
              </h3>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.space}>
              <h3 className={styles.simpleText}>
                <b>Private Key</b>
              </h3>
            </div>
            <button className={styles.default}>Show Private Key</button>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.formContent}>
          <h3 className={styles.principal}>TRX Balance</h3>
          <h3 className={styles.number}>999,999.99</h3>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardHeaderTitle}>Tokens</h2>
        </div>
        <table className={styles.tokens}>
          <thead>
            <tr className={styles.title}>
              <th className={styles.text}>Name</th>
              <th className={styles.textRight}>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.text}>Alpacoin</td>
              <td className={styles.textRight}>11</td>
            </tr>
            <tr>
              <td className={styles.text}>DTCLaBALAYETTE (DTC)</td>
              <td className={styles.textRight}>10</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Account;
