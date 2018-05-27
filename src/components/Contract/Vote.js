import React from 'react';
import { List, Icon } from 'antd';
import moment from 'moment';
import styles from './Contract.less';

export default ({ transaction }) => {
  const totalVotes = transaction.contractData.votes.reduce((prev, curr) => {
    return (prev + curr.voteCount);
  }, 0);

  return (
    <React.Fragment>
      <List.Item.Meta
        title={
          <div className={styles.address}>
            <div>Type: Vote</div>
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
          {totalVotes}
          <Icon type="like-o" style={{ marginLeft: 5, fontSize: 24, color: 'blue' }} />
        </div>
      </div>
    </React.Fragment >
  );
};
