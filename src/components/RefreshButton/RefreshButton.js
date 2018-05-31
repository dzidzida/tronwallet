import React from 'react';
import { Button } from 'antd';

import styles from './RefreshButton.less';

export default () => {
  return (
    <div className={styles.refresh}>
      <p className={styles.error}>Communication with server failed</p >
      <Button
        type="primary"
        size="large"
        icon="reload"
        onClick={() => window.location.reload()}
      >Refresh Page
      </Button>
    </div>);
};
