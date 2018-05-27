import React from 'react';
import { List, Icon } from 'antd';
import moment from 'moment';
import styles from './Contract.less';

export default ({ transaction }) => {
  const { contractData } = transaction;

  return (
    <React.Fragment>
      <List.Item.Meta
        title={
          <div className={styles.address}>
            <div>Type: Create</div>
            <div>Token: {contractData.name}</div>
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
          {contractData.num} TRX
          <Icon type="plus-square-o" style={{ marginLeft: 5, fontSize: 24, color: 'blue' }} />
        </div>
      </div>
    </React.Fragment >
  );
};
