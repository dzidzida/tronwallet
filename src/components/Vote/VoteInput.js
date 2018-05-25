import React, { Component, Fragment } from 'react';
import { InputNumber, Button } from 'antd';
import styles from './../../routes/Vote/Vote.less';

class VoteInput extends Component {
  static defaultProps = {
    onChange: () => {},
    defaultValue: 0,
    max: 1000,
    min: 0,
  };

  state = {
    value: 0,
  };

  onChange = (value) => {
    this.setState({ value });
    this.props.onChange(value);
  };

  onReset = (address) => {
    this.setState({ value: 0 });
    this.props.onResetVotes(address);
  }

  render() {
    const { min, max, defaultValue, step, totalRemaining, item } = this.props;
    const { value } = this.state;

    return (
      <Fragment>
        <InputNumber
          min={min}
          max={max}
          step={step}
          value={value}
          defaultValue={defaultValue}
          onChange={this.onChange}
          formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        />
        <div className={styles.smallButtonsContainer}>
          <Button
            className={styles.smallButtons}
            style={{ marginBottom: 5 }}
            type="primary"
            size="small"
            onClick={() => this.onChange(totalRemaining)}
            icon="to-top"
          >
            Máx
          </Button>
          <Button
            className={styles.smallButtons}
            size="small"
            onClick={() => this.onReset(item.address)}
            icon="close-circle-o"
          >
            Reset
          </Button>
        </div>
      </Fragment>
    );
  }
}

export default VoteInput;
