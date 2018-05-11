import React, { Component } from 'react';
import { Affix } from 'antd';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';
import styles from './Vote.less';
import votes from '../../utils/wallet-service/votes.json';
import Client from '../../utils/wallet-service/client';

class Vote extends Component {
  state = {
    voteList: [],
    totalTrx: 1000000,
    totalRemaining: 1000000,
    transaction: {
      loading: false,
      status: false,
      qrcode: null,
      error: null,
    },
  };

  componentDidMount() {
    this.onLoadWitness();
  }

  onLoadWitness = async () => {
    const voteList = await Client.getWitnesses();
    this.setState({ voteList });
  };

  onCloseModal = () => {
    this.setState({ modalVisible: false });
  };

  handleSearch = e => {
    const { value } = e.target;
    const { voteList } = this.state;
    if (value) {
      const regex = new RegExp(value, 'i');
      const votesFilter = voteList.filter(vote => {
        return vote.address.match(regex) || vote.url.match(regex);
      });
      this.setState({ voteList: votesFilter });
    } else {
      this.setState({ voteList: votes });
    }
  };

  submit = async () => {
    const { voteList, transaction } = this.state;
    const votesPrepared = [];
    this.setState({ transaction: { ...transaction, loading: true } });
    voteList.forEach(vote => {
      if (vote.amount && vote.amount > 0) {
        votesPrepared.push({ address: vote.address, amount: Number(vote.amount) });
      }
    });
    try {
      const TransactionData = await Client.voteForWitnesses(votesPrepared);
      if (!TransactionData) {
        throw Error();
      } else {
        this.setState({
          modalVisible: true,
          transaction: { ...transaction, data: TransactionData },
        });
      }
      // TODO
      // Now do something
    } catch (error) {
      this.setState({ voteError: 'Something wrong voting' });
    }
  };

  change = (e, id) => {
    const { voteList, totalTrx } = this.state;
    const { value } = e.target;
    voteList.find(v => v.id === id).amount = value;

    this.setState({ voteList }, () => {
      const totalVotes = this.state.voteList.reduce((prev, vote) => {
        return Number(prev) + Number(vote.amount || 0);
      }, 0);
      this.setState({ totalRemaining: totalTrx - totalVotes });
    });
  };

  handleBack = () => {
    const { transaction } = this.state;
    this.setState({ transaction: { ...transaction, status: false, qrcode: '' } });
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

  renderProgressBar = () => {
    const { totalRemaining, totalTrx } = this.state;
    const percent = (totalTrx - totalRemaining) / totalTrx * 100;
    if (totalRemaining < 0) {
      return <div className={styles.progressBarDanger} style={{ width: '100%' }} />;
    } else if (totalRemaining === 0) {
      return <div className={styles.progressBarSuccess} style={{ width: '100%' }} />;
    }
    return <div className={styles.progressBar} style={{ width: `${percent}%` }} />;
  };

  render() {
    const { voteList, transaction, voteError, modalVisible } = this.state;
    return (
      <div className={styles.container}>
        <input
          className={styles.search}
          placeholder="Search for address or URL"
          onChange={this.handleSearch}
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
                {voteList.map((vote, index) => {
                  return (
                    <tr key={vote.address}>
                      <td>
                        <b>{index + 1}</b>
                      </td>
                      <td>
                        {vote.address}
                        <br />
                        <small>{vote.url}</small>
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
              <div className={styles.progress}>{this.renderProgressBar()}</div>
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
            <h3 className={styles.error}>{voteError}</h3>
          </Affix>
        </div>
        <ModalTransaction
          title="Vote"
          message="Thanks for the vote submission"
          data={transaction.data}
          visible={modalVisible}
          onClose={this.onCloseModal}
        />
      </div>
    );
  }
}
export default Vote;
