import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import { MiniArea } from '../Charts';
import NumberInfo from '../NumberInfo';

import styles from './index.less';

export default class ActiveChart extends Component {
  static propTypes = {
    lastDay: PropTypes.object,
  };

  static defaultProps = {
    lastDay: {},
  };

  render() {
    const { data, lastDay } = this.props;

    return (
      <div className={styles.activeChart}>
        {lastDay.total && <NumberInfo total={`$${lastDay.total}`} />}
        <div style={{ marginTop: 24 }}>
          <MiniArea
            animate={false}
            line
            borderWidth={2}
            height={84}
            yAxis={{
              tickLine: true,
              label: false,
              title: false,
              line: false,
            }}
            data={data}
          />
        </div>
        {/* data && data.length && (
          <div className={styles.activeChartLegend}>
            {data.map(d => {
              return (<span>{d.x}</span>)
            })}
          </div>
        ) */}
      </div>
    );
  }
}
