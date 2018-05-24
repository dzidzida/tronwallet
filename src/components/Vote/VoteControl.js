import React, { Component } from 'react';
import { Button, Affix } from 'antd';
import _ from 'lodash';
import styles from './index.less';
import voteStyles from '../../routes/Vote/Vote.less';

class VoteControl extends Component {
  static defautlProps = {
    totalRemaining: 0,
    totalTrx: 0,
    onStartVote: () => {},
  };

  state = {
    // isVotting: false,
    affix: false,
  };

  onStartClick = () => {
    // this.setState({ isVotting: true }, this.props.onStartVote);
  };

  onChangeAffix = affix => this.setState({ affix });

  renderSubmitButton = () => {
    const { totalRemaining, totalTrx, onSubmit, balance } = this.props;

    if (totalRemaining < 0 || !balance) {
      return (
        <Button type="primary" disabled>
          SUBMIT
        </Button>
      );
    }
    return (
      <Button
        type="primary"
        onClick={onSubmit}
        disabled={Number(totalTrx) === Number(totalRemaining)}
        icon="check-circle-o"
      >
        SUBMIT
      </Button>
    );
  };

  renderSubmit = () => {
    const { totalRemaining, onResetVotes, totalVotes, userVotes } = this.props;
    const { affix } = this.state;
    const affixStyle = affix
      ? { position: 'absolute', backgroundColor: '#ffffff', padding: 50 }
      : null;
    return (
      <Affix offsetTop={0} style={affixStyle} onChange={this.onChangeAffix}>
        <div className={affix ? voteStyles.out : voteStyles.headerInfo}>
          <span>Votes Remaining</span>
          <p className={totalRemaining < 0 ? styles.totalRemainingDanger : ''}>
            {Number(totalRemaining).toLocaleString()}
          </p>
          <div className={styles.containerVoteButtons}>
            <Button
              onClick={() => onResetVotes(null)}
              icon="close-circle-o"
              style={{ marginRight: 5 }}
            >
              RESET
            </Button>
            {this.renderSubmitButton()}
          </div>
          {!totalVotes && _.isEmpty(userVotes) ? (
            <div>
              <a href="/" style={{ fontSize: 12 }}>
                No votes available found.<br />Please, freeze tokens on dashboard before vote
              </a>
            </div>
          ) : null}
        </div>
      </Affix>
    );
  };

  renderStart = () => (
    <Button type="danger" size="large" onClick={this.onStartClick}>
      START VOTING
    </Button>
  );

  render() {
    // const { isVotting } = this.state;
    return (
      <div className={styles.voteControl}>
        {/* {isVotting ? this.renderSubmit() : this.renderStart()} */}
        {this.renderSubmit()}
      </div>
    );
  }
}

export default VoteControl;
