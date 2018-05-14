import React, { Component } from 'react';
import moment from 'moment';
import styles from './Vote.less';

class CowntDownInfo extends Component {
  state = {
    voteCycleRemaining: null,
  };

  componentWillReceiveProps() {
    this.onLoadVoteCycleRemaining();
  }

  onLoadVoteCycleRemaining = () => {
    const { endTime } = this.props;

    if (!endTime) {
      return;
    }
    this.setState({ voteCycleRemaining: this.getTimeRemaining(endTime) }, () => this.startTimer());
  };

  getTimeRemaining = () => {
    const currentDateInMilis = new Date().getTime();
    const endTimeInMilis = this.props.endTime.getTime();
    return new Date(endTimeInMilis - currentDateInMilis);
  };

  isTimeover = dateTimeRemaining => {
    const hours = dateTimeRemaining.getUTCHours();
    const minutes = dateTimeRemaining.getUTCMinutes();
    const seconds = dateTimeRemaining.getUTCSeconds();

    return hours === 0 && minutes === 0 && seconds === 0;
  };

  countDown = () => {
    this.setState(
      {
        voteCycleRemaining: this.getTimeRemaining(),
      },
      () => {
        if (this.isTimeover(this.state.voteCycleRemaining)) {
          clearInterval(this.timer);
        }
      }
    );
  };

  formatDate = dateTime => {
    if (!dateTime) {
      return '00:00:00';
    }
    return moment(dateTime)
      .utc()
      .format('HH:mm:ss');
  };

  startTimer = () => {
    if (!this.timer) {
      this.timer = setInterval(this.countDown, 1000);
    }
  };

  render() {
    const { voteCycleRemaining } = this.state;
    const { title } = this.props;
    return (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{this.formatDate(voteCycleRemaining)}</p>
      </div>
    );
  }
}

export default CowntDownInfo;
