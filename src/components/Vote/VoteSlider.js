import React, { PureComponent } from 'react';
import { Icon, Slider } from 'antd';
import styles from './index.less';

class VoteSlider extends PureComponent {
  state = {
    value: 0,
    maxValue: 0,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.isReset) {
      this.setState({ value: 0 });
    }
    this.setState({ maxValue: nextProps.isMax });
  }

  formatter = value => {
    return value.toLocaleString();
  };

  render() {
    const { onVoteChange, totalTrx } = this.props;
    const { value, maxValue } = this.state;

    return (
      <div className={styles.iconWrapper}>
        <Icon className={styles.anticon} type="frown-o" />
        <Slider
          onAfterChange={onVoteChange}
          onChange={v => this.setState({ value: v, maxValue: v })}
          step={10}
          value={maxValue || value}
          max={totalTrx}
          tipFormatter={this.formatter}
        />
        <Icon className={styles.anticon} type="smile-o" />
      </div>
    );
  }
}

export default VoteSlider;
