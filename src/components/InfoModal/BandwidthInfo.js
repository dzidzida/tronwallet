import React from 'react';
import { Modal } from 'antd';
import style from './style.less';

const BandwidthInfo = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      title="Bandwidth Points"
      style={{ top: 20 }}
      footer={[]}
      width={700}
    >
      <p className={style.justify}>
        Having too many transactions will clog our network like Ethereum and may
        incur delays on transaction confirmation. To keep the network operating
        smoothly, TRON network only allows every account to initiate a limited
        number of transactions. To engage in transactions more frequently
        requires bandwidth points. Like TRON Power (TP), bandwidth points can be
        obtained through freezing TRX.
      </p>
      <ol>
        <li className={style.justify}>
          <b>Definition of bandwidth points</b>
          <p className={style.justify}>
            Transactions are transmitted and stored in the network in byte
            arrays. Bandwidth points consumed in a transaction equals the size
            of its byte array.
          </p>
          <p className={style.justify}>
            If the length of a byte array is 100 then the transaction consumes
            100 bandwidth points.
          </p>
        </li>
        <li className={style.justify}>
          <b>Calculation of bandwidth points</b>
          <p className={style.justify}>
            Bandwidth points are the number of usable bytes for an account per
            day.
          </p>
          <p className={style.justify}>
            Within a given period of time, the entire network could only handle
            a fixed amount of bandwidth.To TRON’ network, the daily capacity is
            approximately 54G.
          </p>
          <p className={style.justify}>
            The ratio of bandwidth points in an account to the bandwidth
            capacity of TRON’s network equals the ratio of frozen balance in an
            account to frozen balance on the entire network.
          </p>
          <p className={style.justify}>
            e.g If frozen asset on the entire network totals 1,000,000 TRX and
            one given account froze 1,000 TRX, or 0.1% of total TRX frozen, then
            the account has 0.1%*54GB=54MB bandwidth points for its
            transactions.
          </p>
          <p className={style.justify}>
            Note: Since the amount of frozen asset on the entire network and for
            a certain account are subject to change, bandwidth points held by an
            account isn’t always fixed.
          </p>
        </li>
        <li className={style.justify}>
          <b>Complimentary bandwidth points</b>
          <p className={style.justify}>
            There are 1K bandwidth points for free per account per day. When an
            account hasn’t frozen any balance, or when its bandwidth points have
            run out, complimentary bandwidth points can be used.
          </p>
          <p className={style.justify}>
            Each transaction in Tron’ network is about 200 bytes, so each
            account enjoys about 5 transactions for free each day.
          </p>
          <p className={style.justify}>
            Note: total complimentary bandwidth takes up 1/4 of total bandwidth
            on the network, amounting to 13.5 GB. When total complimentary
            bandwidth used exceeds that threshold (meaning too many accounts
            have used complimentary bandwidth points), even if there are
            sufficient complimentary bandwidth points in an account, they cannot
            be used for transaction.
          </p>
        </li>
        <li className={style.justify}>
          <b>Token transfer</b>
          <p className={style.justify}>
            For transactions of token transfer, bandwidth points will first be
            charged from the token issuer.
          </p>
          <p className={style.justify}>
            When issuing tokens, the issuer can configure a limit to maximum
            bandwidth consumption, namely the maximal bandwidth points which can
            be charged from him/her for a token holder’s token transfers within
            24 hours and the maximal total of bandwidth points.
          </p>
          <p className={style.justify}>
            These two parameters can be configured through updateAsset
            interface.
          </p>
        </li>
        <li className={style.justify}>
          <b>Consumption of bandwidth points</b>
          <p className={style.justify}>
            Aside from inquiries, any other type of transaction consumes
            bandwidth points. The bandwidth consumption procedure is as follows:
          </p>
          <ol>
            <li className={style.justify}>
              If the transaction isn’t a token transfer, skip to step 2. If the
              transaction is a token transfer, TRON will try to charge bandwidth
              points from the token issuer. If the issuer does not have
              sufficient bandwidth points or the charge is beyond the issuer’s
              maximal threshold, go to step 2.
            </li>
            <li className={style.justify}>
              Bandwidth points will be charged from the initiator. If
              insufficient, go to step 3.
            </li>
            <li className={style.justify}>
              Complimentary bandwidth points will be charged from the initiator.
              If again insufficient, transaction fails.
            </li>
          </ol>
          <p className={style.justify}>
            Note: When balance unfreezes, bandwidth points will be cleared since
            there is no more frozen TRX.
          </p>
        </li>
        <li className={style.justify}>
          <b>Account creation</b>
          <p className={style.justify}>
            Account creation costs transaction initiator 10,000 bandwidth points
          </p>
          <p>
            Users can create new accounts for token transfer.
          </p>
        </li>
      </ol>
    </Modal>
  );
};

export default BandwidthInfo;
