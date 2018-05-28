import React from 'react';
import { List, Icon, Tag } from 'antd';
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
            <Tag color="#bf00c8">Vote</Tag>
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
          {totalVotes} TRX
          <Icon type="like-o" style={{ marginLeft: 5, fontSize: 20, color: '#011529' }} />
        </div>
      </div>
    </React.Fragment >
  );
};
