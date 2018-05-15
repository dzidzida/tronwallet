import React, { Component } from 'react';
import { Button, Affix, Card } from 'antd';
import styles from './index.less';

const { Meta } = Card;

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
    const { totalRemaining, totalTrx, onSubmit } = this.props;

    if (totalRemaining < 0) {
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
      >
        SUBMIT
      </Button>
    );
  };

  renderSubmit = () => {
    const { totalRemaining } = this.props;
    const { affix } = this.state;
    const affixStyle = affix ? { position: 'absolute' } : null;
    return (
      <Affix offsetTop={0} style={affixStyle} onChange={this.onChangeAffix}>
        <Card>
          <Meta
            title={<h1>{Number(totalRemaining).toLocaleString()}</h1>}
            description="Votes Remaining"
          />

          <div style={{ marginTop: 8 }}>
            <Button>RESET</Button>
            {'   '}
            {this.renderSubmitButton()}
          </div>
        </Card>
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
