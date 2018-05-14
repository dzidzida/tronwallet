import React, { Component } from 'react';
import {
  Affix,
  Card,
  Row,
  Col,
  List,
} from 'antd';

import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';

import styles from './Vote.less';
import votes from '../../utils/wallet-service/votes.json';
import Client from '../../utils/wallet-service/client';
import CowntDownInfo from './CowntDownInfo';
import Header from './../../components/Vote/Header';
import ListContent from './../../components/Vote/ListContent';
import ProgressItem from './../../components/Vote/ProgessItem';
import VoteControl from './../../components/Vote/VoteControl';
import VoteInput from './../../components/Vote/VoteInput';

const Info = ({ title, value, bordered }) => (
  <div className={styles.headerInfo}>
    <span>{title}</span>
    <p>{value}</p>
    {bordered && <em />}
  </div>
);


class Vote extends Component {
  state = {
    voteList: [],
    totalTrx: 0,
    totalRemaining: 0,
    endTime: null,
    totalVotes: 0,
    inVoting: false,
    transaction: {
      loading: false,
      status: false,
      qrcode: null,
      error: null,
    },
  };

  // #region logic
  componentDidMount() {
    this.onLoadWitness();
    this.onLoadAvailable();
    this.onLoadEndTime();
    this.onLoadTotalVotes();
  }

  onVoteChange = (id, value) => {
    console.log("vote", id, value);
  }

  onLoadWitness = async () => {
    const voteList = await Client.getWitnesses();
    this.setState({ voteList });
  };

  onLoadAvailable = async () => {
    const balances = await Client.getBalances();
    const trxBalance = balances.find(bl => bl.name === 'TRX');
    let totalTrx = 0;
    if (trxBalance) totalTrx = Number(trxBalance.balance).toFixed(0);
    this.setState({ totalTrx, totalRemaining: totalTrx });
  };

  onLoadEndTime = async () => {
    const endTimeInMilis = votes.end_time;
    if (!endTimeInMilis) {
      return;
    }
    const endTime = new Date(endTimeInMilis);
    this.setState({ endTime });
  };

  onLoadTotalVotes = async () => {
    const totalVotesWithouFormat = +votes.total_votes;
    if (!totalVotesWithouFormat) {
      return;
    }
    const totalVotes = totalVotesWithouFormat.toLocaleString();
    this.setState({ totalVotes });
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
      if (vote.amount && Number(vote.amount) > 0) {
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

  change = (e, address) => {
    const { voteList, totalTrx } = this.state;
    const { value } = e.target;
    voteList.find(v => v.address === address).amount = value;
    this.setState({ voteList }, () => {
      const totalVotes = this.state.voteList.reduce((prev, vote) => {
        return Number(prev) + Number(vote.amount || 0);
      }, 0);
      this.setState({ totalRemaining: totalTrx - totalVotes });
    });
  };

  onStartVote = () => {
    this.setState({ inVoting: true });
  }

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
  // #endregion

  render() {
    const { voteList, transaction, voteError, modalVisible, endTime, totalVotes, totalRemaining, inVoting, totalTrx } = this.state;
    return (
      <div className={styles.container}>
        <Card bordered={false}>
          <Row className={styles.blockSeparator} type="flex" align="middle">
            <Col sm={8} xs={24}>
              <CowntDownInfo title="Vote cycle ends in" endTime={endTime} />
            </Col>
            <Col sm={8} xs={24}>
              <Info title="Total votes" value={totalVotes} />
            </Col>

            <Col sm={8} xs={24} bordered={false}>
              <VoteControl
                totalRemaining={totalRemaining}
                onStartVote={this.onStartVote}
                totalTrx={totalTrx}
                onSubmit={this.submit}
              />
            </Col>
          </Row>
        </Card>

        <Card
          className={styles.listCard}
          title="VOTES"
          style={{ marginTop: 24 }}
          bodyStyle={{ padding: '0 0px 40px 0px' }}
          loading={transaction.status}
        >
          <List
            rowKey="id"
            loading={false}
            size="large"
            dataSource={voteList}
            header={<Header inVoting={inVoting} />}
            renderItem={(item, index) => (
              <List.Item
                key={item.id}
                actions={[
                  <ProgressItem votes={item.votes} total={totalVotes} />,
                  <VoteInput show={inVoting} onChange={(value) => this.onVoteChange(item.id, value)} />,
                ]}
              >
                <ListContent index={index + 1} {...item} />
              </List.Item>
            )}
          />
        </Card>
        <ModalTransaction
          title="Vote"
          message="Please, validate your transaction"
          data={transaction.data}
          visible={modalVisible}
          onClose={this.onCloseModal}
        />
      </div>
    );
  }
}
export default Vote;
