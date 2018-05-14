import React from 'react';
import styles from './index.less';

const ItemIndex = ({ index }) => (
  <div className={styles.itemIndex}>
    <strong>#{index}</strong>
  </div>
);

export default ItemIndex;
