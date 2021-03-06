import React from 'react';
import { List, Icon } from 'antd';
import moment from 'moment';
import styles from './Contract.less';
// import { formatAmount } from './util';

export default ({ transaction }) => {
//   const { contractData } = transaction;

  return (
    <React.Fragment>
      <List.Item.Meta
        title={
          <div className={styles.address}>
            <div>Type: Unfreeze</div>
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
          <Icon type="unlock" style={{ marginLeft: 5, fontSize: 20, color: '#011529' }} />
        </div>
      </div>
    </React.Fragment >
  );
};
