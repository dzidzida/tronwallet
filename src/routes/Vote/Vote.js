import React, { Component } from 'react';
import { Affix, AutoComplete } from 'antd';
import * as QRCode from 'qrcode';
import QRCodeCard from '../QRCode/QRCode';
import styles from './Vote.less';
import votes from '../../utils/wallet-service/votes.json';
import { Client } from '../../utils/wallet-service/client';

class Vote extends Component {
  state = {
    voteList: [],
    totalTrx: 1000000,
    totalRemaining: 0,
    list: [],
    transaction: {
      loading: false,
      status: false,
      qrcode: null,
      error: null,
    },
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
    const { voteList, transaction } = this.state;
    const votesPrepared = [];
    this.setState({ transaction: { ...transaction, loading: true } });
    voteList.forEach(vote => {
      votesPrepared.push({ address: vote.address, amount: Number(vote.amount) });
    });

    const TransactionData = await Client.voteForWitnesses(votesPrepared);
    const updatedTransaction = { ...transaction };

    if (TransactionData) {
      const qrcode = await QRCode.toDataURL(TransactionData);
      updatedTransaction.status = true;
      updatedTransaction.qrcode = qrcode;
    } else {
      updatedTransaction.status = false;
      updatedTransaction.error = 'Something wrong with the Vote';
    }
    updatedTransaction.loading = false;
    this.setState({ transaction: updatedTransaction });
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
    const { voteList, list, transaction } = this.state;
    if (transaction.status) {
      return (
        <QRCodeCard title="Vote TRX" message="Succesfully vote!" qrcode={transaction.qrcode}>
          <button onClick={this.handleBack} className={styles.default}>
            Make another vote
          </button>
        </QRCodeCard>
      );
    }
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
          </Affix>
        </div>
      </div>
    );
  }
}
export default Vote;
