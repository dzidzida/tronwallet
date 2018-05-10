import React from 'react';
import styles from './QRCode.less';

const QRCode = ({ title, message, qrcode, children }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardHeaderTitle}>{title}</h2>
      </div>
      <div className={styles.transaction}>
        <div className={styles.messageContentSuccess}>
          <h2 className={styles.messageSuccess}>{message}</h2>
        </div>
        <h4>You can check with this QRCode</h4>
        <img className={styles.qrcode} src={qrcode} alt="Transaction QRCode" />
        {children}
      </div>
    </div>
  );
};

export default QRCode;
