import React, { Component } from 'react';
import { Card, Row, Col, List, Spin, Input } from 'antd';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';

import styles from './Vote.less';
import votes from '../../utils/wallet-service/votes.json';
import Client from '../../utils/wallet-service/client';
import CowntDownInfo from './CowntDownInfo';
import Header from './../../components/Vote/Header';
import ListContent from './../../components/Vote/ListContent';
import ProgressItem from './../../components/Vote/ProgessItem';
import VoteControl from './../../components/Vote/VoteControl';
// import VoteInput from './../../components/Vote/VoteInput';
import VoteSlider from './../../components/Vote/VoteSlider';

const Info = ({ title, value, bordered }) => (
  <div className={styles.headerInfo}>
    <span>{title}</span>
    <p>{value}</p>
    {bordered && <em />}
  </div>
);

class Vote extends Component {
  state = {
    voteError: undefined,
    voteList: [],
    totalTrx: 0,
    totalRemaining: 0,
    endTime: null,
    totalVotes: 0,
    inVoting: false,
    transaction: '',
    isReset: true,
    loading: true,
    // transaction: {
    //   loading: false,
    //   status: false,
    //   qrcode: null,
    //   error: null,
    // },
  };

  // #region logic
  componentDidMount() {
    // this.onLoadWitness();
    // this.onLoadAvailable();
    this.onLoadData();
    this.onLoadEndTime();
    this.onLoadTotalVotes();
  }

  onLoadData = async () => {
    const data = await Promise.all([Client.getWitnesses(), Client.getBalances()]);

    const voteList = data[0];
    const balances = data[1];

    const trxBalance = balances.find(bl => bl.name === 'TRX');
    let totalTrx = 0;
    if (trxBalance) totalTrx = Number(trxBalance.balance).toFixed(0);

    this.setState({ voteList, totalTrx, totalRemaining: totalTrx, loading: false });
  };

  // onLoadWitness = async () => {
  //   const voteList = await Client.getWitnesses();
  //   this.setState({ voteList });
  // };

  // onLoadAvailable = async () => {
  //   const balances = await Client.getBalances();
  //   const trxBalance = balances.find(bl => bl.name === 'TRX');
  //   let totalTrx = 0;
  //   if (trxBalance) totalTrx = Number(trxBalance.balance).toFixed(0);
  //   this.setState({ totalTrx, totalRemaining: totalTrx });
  // };

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

    const totalVotes = totalVotesWithouFormat;
    this.setState({ totalVotes });
  };

  onCloseModal = () => {
    this.setState({ modalVisible: false });
  };

  onStartVote = () => {
    this.setState({ inVoting: true });
  };

  onResetVotes = () => {
    const { voteList, totalTrx } = this.state;
    voteList.filter(v => v.amount).forEach(v => {
      const vt = v;
      delete vt.amount;
    });
    this.setState({ voteList, totalRemaining: totalTrx, isReset: true });
  };

  onVoteChange = (address, value) => {
    const { voteList, totalTrx } = this.state;
    voteList.find(v => v.address === address).amount = value;
    this.setState({ voteList, isReset: false }, () => {
      const totalVotes = this.state.voteList.reduce((prev, vote) => {
        return Number(prev) + Number(vote.amount || 0);
      }, 0);
      this.setState({ totalRemaining: totalTrx - totalVotes });
    });
  };

  submit = async () => {
    const { voteList } = this.state;
    const votesPrepared = {};
    voteList.forEach(vote => {
      if (vote.amount && Number(vote.amount) > 0) {
        const key = vote.address;
        votesPrepared[key] = vote.amount;
      }
    });

    try {
      const TransactionData = await Client.voteForWitnesses(votesPrepared);
      if (!TransactionData) {
        throw Error();
      } else {
        this.setState({ modalVisible: true, transaction: TransactionData });
      }
      // TODO
      // Now do something
    } catch (error) {
      this.setState({ voteError: 'Something wrong voting' });
    }
  };

  handleSearch = async (e) => {
    const { value } = e.target;
    const { voteList } = this.state;
    if (value) {
      const regex = new RegExp(value, 'i');
      const votesFilter = voteList.filter(vote => {
        return vote.address.match(regex) || vote.url.match(regex);
      });
      this.setState({ voteList: votesFilter });
    } else {
      const allVotes = await Client.getWitnesses();
      this.setState({ voteList: allVotes });
    }
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
  // #endregion

  render() {
    const {
      voteList,
      transaction,
      voteError,
      modalVisible,
      endTime,
      totalVotes,
      totalRemaining,
      inVoting,
      totalTrx,
      isReset,
      loading,
    } = this.state;

    if (loading) {
      return (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <Card bordered={false}>
          <Row className={styles.blockSeparator} type="flex" align="middle">
            <Col sm={8} xs={24}>
              <CowntDownInfo title="Vote cycle ends in" endTime={endTime} />
            </Col>
            <Col sm={8} xs={24}>
              <Info title="Total votes" value={totalVotes.toLocaleString()} />
            </Col>

            <Col sm={8} xs={24} bordered={false}>
              <VoteControl
                totalRemaining={totalRemaining}
                onStartVote={this.onStartVote}
                totalTrx={totalTrx}
                onSubmit={this.submit}
                onResetVotes={this.onResetVotes}
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
          extra={
            <Input
              placeholder="Search vote"
              onChange={this.handleSearch}
              style={{ width: 400 }}
            />
          }
        >
          <p>{voteError}</p>
          <List
            rowKey="id"
            loading={false}
            size="large"
            dataSource={voteList}
            header={<Header inVoting={inVoting} />}
            renderItem={(item, index) => (
              <List.Item
                key={item.address}
                actions={[
                  <ProgressItem votes={Number(item.votes)} total={totalVotes} />,
                  <VoteSlider
                    onVoteChange={v => this.onVoteChange(item.address, v)}
                    totalTrx={totalTrx}
                    isReset={isReset}
                  />,
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
          data={transaction}
          visible={modalVisible}
          onClose={this.onCloseModal}
        />
      </div>
    );
  }
}
export default Vote;
