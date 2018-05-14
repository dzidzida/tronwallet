import React, { Component } from 'react';
import { Button, Affix, Card } from 'antd';
import styles from './index.less';

const { Meta } = Card;

class VoteControl extends Component {

  static defautlProps = {
    totalRemaining: 0,
    totalTrx: 0,
    onStartVote: () => { }
  }

  state = {
    isVotting: false,
    affix: false,
  }

  onStartClick = (e) => {
    this.setState({ isVotting: true }, this.props.onStartVote);
  }

  onChangeAffix = (affix) => this.setState({ affix });

  renderSubmitButton = () => {
    const { totalRemaining, totalTrx, onSubmit } = this.props;

    if (totalRemaining < 0) {
      return (
        <Button
          type="danger"
          size="large"
          disabled
        >
          Submit Votes
        </Button>
      );
    }
    return (
      <Button
        type="danger"
        size="large"
        onClick={onSubmit}
        disabled={totalTrx === totalRemaining}
      >
        Submit Votes
      </Button>
    );
  }

  renderSubmit = () => {
    const { totalRemaining } = this.props;
    const { affix } = this.state;
    const affixStyle = affix ? { position: 'absolute' } : null
    return (
      <Affix offsetTop={0} style={affixStyle} onChange={this.onChangeAffix} >
        <Card
          style={{ width: 300 }}
          actions={[
            <Button size="large" >RESET</Button>,
            this.renderSubmitButton()
          ]}
        >
          <Meta
            title={<h1>{totalRemaining}</h1>}
            description="Votes Remaining"
          />
        </Card>
      </Affix>
    );
  }

  renderStart = () => (
    <Button type="danger" size="large" onClick={this.onStartClick}>START VOTING</Button>
  )

  render() {
    const { isVotting } = this.state;
    return (
      <div className={styles.voteControl}>
        {isVotting ? this.renderSubmit() : this.renderStart()}
      </div>
    );
  }
}

export default VoteControl;
