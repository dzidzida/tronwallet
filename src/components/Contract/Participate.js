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
            <Tag color="#2fd566">Participate</Tag>
            <div>Token: {contractData.token}</div>
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
          {formatAmount(contractData.amount)} TRX
          <Icon type="team" style={{ marginLeft: 5, fontSize: 20, color: '#011529' }} />
        </div>
      </div>
    </React.Fragment >
  );
};
