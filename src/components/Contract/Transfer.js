import React from 'react';
import { List, Icon, Tag } from 'antd';
import moment from 'moment';
import styles from './Contract.less';
import { formatAmount } from './util';

const handleToken = (token, amount) => {
  if (token !== 'TRX') return amount.toLocaleString();
  else return formatAmount(amount);
};

export default ({ transaction }) => {
  return (
    <React.Fragment>
      <List.Item.Meta
        title={
          <div className={styles.address}>
            <Tag color="#108ee9">Transfer</Tag>

            <div>From: {transaction.transferFromAddress}</div>
            <div>To: {transaction.transferToAddress}</div>
          </div>
        }
        description={
          <div className={styles.address}>
            <div className={styles.itemFont}>
              {moment(transaction.timestamp).fromNow()}
            </div>
          </div>
        }
      />
      <div>
        <div className={styles.itemFont}>
          {transaction.transferFromAddress === transaction.ownerAddress ?
            (`-${handleToken(transaction.tokenName, transaction.amount)}`) :
            (`+${handleToken(transaction.tokenName, transaction.amount)}`)}
          {' '}
          {transaction.tokenName}
          {
            transaction.transferFromAddress === transaction.ownerAddress ? (
              <Icon type="arrow-down" style={{ marginLeft: 5, fontSize: 24, color: 'red' }} />
            ) : (
              <Icon type="arrow-up" style={{ marginLeft: 5, fontSize: 24, color: '#53d769' }} />
              )
          }
        </div>
      </div>
    </React.Fragment >
  );
};

