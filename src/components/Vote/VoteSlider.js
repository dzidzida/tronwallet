import React, { PureComponent } from 'react';
import { Icon, Slider } from 'antd';
import styles from './index.less';

class VoteSlider extends PureComponent {
  state = {
    value: 0,
  };

  render() {
    const { onVoteChange, totalTrx } = this.props;
    const { value } = this.state;
    return (
      <div className={styles.iconWrapper}>
        <Icon className={styles.anticon} type="frown-o" />
        <Slider
          onAfterChange={onVoteChange}
          onChange={v => this.setState({ value: v })}
          step={10}
          value={value}
          max={totalTrx}
        />
        <Icon className={styles.anticon} type="smile-o" />
      </div>
    );
  }
}

export default VoteSlider;
