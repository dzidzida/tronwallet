import React, { Component } from 'react';
import { Affix, AutoComplete } from 'antd';
import styles from './Vote.less';
import votes from '../../utils/wallet-service/votes.json';
import { Client } from '../../utils/wallet-service/client';

class Vote extends Component {
  state = {
    voteList: [],
    totalTrx: 1000000,
    totalRemaining: 0,
    list: [],
  };

  componentWillMount() {
    const { totalTrx } = this.state;
    this.setState({ voteList: votes, totalRemaining: totalTrx });
  }

  handleSearch = value => {
    // console.log('Value searched', value);
    return value;
  };

  submit = async () => {
    const { voteList } = this.state;
    const votesPrepared = [];
    voteList.forEach(vote => {
      votesPrepared.push({ address: vote.address, amount: Number(vote.amount) });
    });
    console.log('>>>>> ', votesPrepared);
    const TransactionData = await Client.voteForWitnesses(votesPrepared);

    if (TransactionData) {
      console.log('TransactionData::::: ', TransactionData);
    } else {
      console.log('DEU RUIM');
    }
  };

  change = (e, id) => {
    const { voteList, totalTrx } = this.state;
    const { value } = e.target;
    voteList.find(v => v.id === id).amount = value;

    this.setState({ voteList }, () => {
      const totalVotes = this.state.voteList.reduce((prev, vote) => {
        return Number(prev) + Number(vote.amount);
      }, 0);
      this.setState({ totalRemaining: totalTrx - totalVotes });
    });
  };

  renderTrxRemaining = () => {
    const { totalRemaining } = this.state;
    if (totalRemaining <= 0) {
      return <p>No TRX remaining</p>;
    }
    return <p>{totalRemaining} TRX remaining</p>;
  };

  renderSubmitButton = () => {
    const { totalRemaining, totalTrx } = this.state;
    if (totalRemaining < 0) {
      return (
        <button className={styles.btDanger} disabled>
          Submit Votes
        </button>
      );
    }
    return (
      <button
        className={styles.btSubmit}
        onClick={this.submit}
        disabled={totalTrx === totalRemaining}
      >
        Submit Votes
      </button>
    );
  };

  render() {
    const { voteList, list } = this.state;
    return (
      <div className={styles.container}>
        <AutoComplete
          dataSource={list}
          size="large"
          style={{ width: '100%' }}
          onSearch={this.handleSearch}
          placeholder="Search for address or URL"
        />
        <div className={styles.content}>
          <div className={styles.tableCol}>
            <div className={styles.divTitle}>Candidates</div>
            <table className={styles.votes}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Address</th>
                  <th>Votes</th>
                  <th>My Vote</th>
                </tr>
              </thead>
              <tbody>
                {voteList.map(vote => {
                  return (
                    <tr key={vote.id}>
                      <td>
                        <b>{vote.id}</b>
                      </td>
                      <td>
                        {vote.address}
                        <br />
                        <small>{vote.site}</small>
                      </td>
                      <td>
                        {vote.votes}
                        <br />
                        TRX
                      </td>
                      <td>
                        <input
                          type="number"
                          className={styles.vote}
                          min="0"
                          onChange={e => this.change(e, vote.id)}
                          value={Number(vote.amount)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Affix offsetTop={10} className={styles.voteCol}>
            <div className={styles.divTitle}>Vote</div>
            <div className={styles.voteCard}>
              {this.renderTrxRemaining()}
              <div className={styles.progress} />
              {this.renderSubmitButton()}
              <p>
                Use your TRX to vote for Super Representatives. For every TRX you hold in your
                account you have one vote to spend. TRX will not be consumed. You can vote as many
                times for the several representatives as you like. The votes are tallied once every
                6 hours and the final election results will be updated at 0:00 AM (0:00) UTC, 6:00
                AM (6:00) UTC, 12:00 PM (12:00) UTC and 6:00 PM (18:00) UTC, and the list of
                SuperRepresentatives will be updated.
              </p>
            </div>
          </Affix>
        </div>
      </div>
    );
  }
}
export default Vote;
