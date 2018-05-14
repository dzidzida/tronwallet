import React from 'react';
import { Progress } from 'antd';

import styles from './index.less';

const ProgressItem = props => {
  console.log('HRER:::: ', props.votes, props.total);
  const percent = Math.floor(props.votes * 100 / props.total);
  return (
    <div className={styles.actionContainer}>
      <strong>{Number(props.votes).toLocaleString()}</strong>
      <Progress percent={percent} status="active" />
    </div>
  );
};

ProgressItem.defaultProps = {
  votes: 0,
  total: 100,
};

export default ProgressItem;
