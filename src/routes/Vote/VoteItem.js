import React, { PureComponent } from 'react';
import { List, InputNumber } from 'antd';

import ListContent from './../../components/Vote/ListContent';
import ProgressItem from './../../components/Vote/ProgessItem';

import styles from './Vote.less';

export default class VoteItem extends PureComponent {
  render() {
    const { item, index, votes, onVoteChange, totalVotes, userVote } = this.props;
    return (
      <List.Item
        key={item.address}
        actions={[
          <div className={styles.listItemRow}>
            <div style={{ margin: 15 }}>
              <ProgressItem votes={Number(item.votes)} total={totalVotes} />
            </div>
            <div className={styles.actionsContainer}>
              <InputNumber
                min={0}
                step={10}
                placeholder={`${userVote || 0}`}
                value={votes || null}
                onChange={(v) => {
                                    if (v >= 0) onVoteChange(item.address, v);
                                }}
              />
            </div>
          </div>,
                ]}
      >
        <ListContent index={index + 1} {...item} />
      </List.Item>
    );
  }
}
