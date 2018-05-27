import React from 'react';
import { List, Icon, Tag } from 'antd';
import moment from 'moment';
import styles from './Contract.less';

export default ({ transaction }) => {
  const { contractData } = transaction;

  return (
    <React.Fragment>
      <List.Item.Meta
        title={
          <div className={styles.address}>
            <Tag color="black">Create</Tag>
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
          <Icon type="plus-square-o" style={{ marginLeft: 5, fontSize: 20, color: '#011529' }} />
        </div>
      </div>
    </React.Fragment >
  );
};
