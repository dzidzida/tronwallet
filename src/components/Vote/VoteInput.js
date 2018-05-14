import React, { Component } from 'react';
import { InputNumber } from 'antd';
import styles from './index.less';

class VoteInput extends Component {
  static defaultProps = {
    onChange: () => {},
    defaultValue: 0,
    max: 1000,
    min: 0,
  };

  onChange = value => {
    this.props.onChange(value);
  };

  render() {
    const { min, max, defaultValue } = this.props;
    if (!this.props.show) return null;

    return (
      <div className={styles.actionContainer}>
        <InputNumber min={min} max={max} defaultValue={defaultValue} onChange={this.onChange} />
      </div>
    );
  }
}

export default VoteInput;
