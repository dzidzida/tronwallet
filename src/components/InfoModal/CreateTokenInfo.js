import React from 'react';
import { Modal } from 'antd';
import style from './style.less';

const CreateTokenInfo = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      title="Token issuance"
      style={{ top: 20 }}
      footer={[]}
      width={700}
    >
      <p className={style.justify}>
        In TRON’s network, every account is capable of issuing tokens. Users can
        lock their tokens in separately.
      </p>
      <p className={style.justify}>
        To issue token, issuer needs to set up token name, total capitalization,
        exchange rate to TRX, circulation duration, description, website,
        maximal bandwidth consumption per account, total bandwidth consumption
        and token freeze.
      </p>
      <ul>
        <li className={style.justify}>e.g.</li>
        <p style={{ backgroundColor: '#FAFAFA', fontFamily: 'monospace' }}>
          assetissue password abc 1000000 1 1 2018-5-31 2018-6-30 abcdef a.com
          1000 1000000 200000 180 300000 365
        </p>
      </ul>
      <p className={style.justify}>
        Tokens named abc are issued with the above command, with a
        capitalization totaling 1 million. The exchange rate of abc to TRX is
        1:1. The duration of circulation is May 31-June 30, 2018. It is
        described as abcdef. The provided website is a.com.
      </p>
      <p className={style.justify}>
        A maximum of 1000 bandwidth points can be charged from the issuer’s
        account per account per day. A maximum of 1,000,000 bandwidth points can
        be charged from the issuer’s account for all token holders’ transactions
        each day. in total capitalization, 200,000 tokens are locked for 180
        days and 300,000 are locked for 365 days.
      </p>
    </Modal>
  );
};

export default CreateTokenInfo;
