import React from 'react';
import { Icon } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import styles from './CopyToClipboard.less';

export default ({ text }) => {
  return (
    <div className={styles.copywrapper}>
      <input className={styles.textinput} name="address" id="address" readOnly value={text} />
      <CopyToClipboard text={text}>
        <button className={styles.copyButton}>
          <Icon type="copy" />
        </button>
      </CopyToClipboard>
    </div>
  );
};
