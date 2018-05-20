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

  formatter = (value) => {
    this.setState({ value });
    return value.toLocaleString();
  };

  render() {
    const { onVoteChange, totalTrx } = this.props;
    const { value, maxValue } = this.state;

    return (
      <div>
        <strong>{this.formatter(value)}</strong>
        <div className={styles.iconWrapper}>
          <Icon className={styles.anticon} type="meh-o" />
          <Slider
            onAfterChange={onVoteChange}
            onChange={v => this.setState({ value: v, maxValue: v })}
            step={1}
            value={maxValue || value}
            max={totalTrx}
            tipFormatter={this.formatter}
          />
          <Icon className={styles.anticon} type="smile-o" />
        </div>
      </div>
    );
  }
}

export default VoteSlider;
