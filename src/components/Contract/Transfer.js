import React from 'react';
import { List, Icon, Tag } from 'antd';
import moment from 'moment';
import styles from './Contract.less';
import { formatAmount } from './util';

export default ({ transaction }) => {
  const { contractData } = transaction;

  return (
    <React.Fragment>
      <List.Item.Meta
        title={
          <div className={styles.address}>
            <Tag color="#108ee9">Transfer</Tag>

            <div>From: {contractData.from}</div>
            <div>To: {contractData.to}</div>
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
          {contractData.from === transaction.ownerAddress ?
                        (`-${formatAmount(contractData.amount)}`) :
                        (`+${formatAmount(contractData.amount)}`)}
          {' '}
          TRX
          {
            contractData.from === transaction.ownerAddress ? (
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

