import React, { Component } from 'react';
import { Card, Row, Col, List, Spin, Input } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';

import styles from './Vote.less';
import Client, { ONE_TRX } from '../../utils/wallet-service/client';
import CowntDownInfo from './CowntDownInfo';
import VoteControl from './../../components/Vote/VoteControl';
import VoteItem from './VoteItem';

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
    transaction: '',
    loading: true,
    userVotes: {},
    balance: 0,
    votesSend: [],
    currentVotes: {},
  };

  // #region logic
  componentDidMount() {
    this.onLoadData();
    this.onLoadEndTime();
  }

  componentWillReceiveProps(nextProps) {
    const { totalFreeze } = nextProps.userWallet;
    if (totalFreeze && totalFreeze.total > 0) {
      const totalTrx = totalFreeze.total / ONE_TRX;
      this.setState({ totalTrx });
    }
  }

  onLoadData = async () => {
    const data = await Promise.all([
      Client.getTotalVotes(),
      Client.getFreeze(),
      Client.getUserVotes(),
    ]);
    const { balance } = this.props.userWallet;
    const voteList = _.orderBy(data[0].candidates, ['votes', 'url'], ['desc', 'asc']) || 0;
    const totalVotes = data[0].totalVotes || 0;
    const frozen = data[1];
    const userVotes = data[2];
    const totalTrx = frozen.total || 0;

    this.setState({
      balance,
      voteList,
      totalTrx,
      totalRemaining: totalTrx,
      totalVotes,
      userVotes,
      loading: false,
    });
  };

  onLoadEndTime = async () => {
    const endTimeInMilis = Date.now() + this.diffSeconds();
    if (!endTimeInMilis) {
      return;
    }
    const endTime = new Date(endTimeInMilis);
    this.setState({ endTime });
  };

  onCloseModal = () => {
    this.setState({ modalVisible: false });
  };

  onResetVotes = (address) => {
    const { totalTrx, votesSend, currentVotes } = this.state;
    const newVotes = { ...currentVotes };
    for (const v in newVotes) {
      if (v) newVotes[v] = 0;
    }

    if (address) {
      const votes = votesSend;
      const index = votes.findIndex(v => v.address === address);
      votes.splice(index, 1);
      this.setState({ votesSend: votes }, () => {
        const totalVotes = this.state.votesSend.reduce((prev, vote) => {
          return Number(prev) + Number(vote.value || 0);
        }, 0);
        this.setState({ totalRemaining: totalTrx - totalVotes, currentVotes: newVotes });
      });
    } else {
      this.setState({ votesSend: [], totalRemaining: totalTrx, isReset: true, currentVotes: newVotes });
    }
  };

  onVoteChange = (address, value) => {
    const { currentVotes, totalTrx } = this.state;
    const newVotes = { ...currentVotes, [address]: value };
    const totalUserVotes = _.reduce(newVotes, (result, value, key) => {
      return result + value;
    }, 0);
    const totalRemaining = totalTrx - totalUserVotes;
    this.setState({ currentVotes: newVotes, totalRemaining });
  }

  diffSeconds = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const fromTime = new Date(2000, 1, 1, utcHour, now.getMinutes(), now.getSeconds());
    let nextHour = 24;

    if (utcHour >= 0 && utcHour < 6) {
      nextHour = 6;
    }
    if (utcHour >= 6 && utcHour < 12) {
      nextHour = 12;
    }
    if (utcHour >= 12 && utcHour < 18) {
      nextHour = 18;
    }
    if (utcHour >= 18 && utcHour < 24) {
      nextHour = 24;
    }
    const toTime = new Date(2000, 1, 1, nextHour, 0, 0);
    const dif = fromTime.getTime() - toTime.getTime();
    const secondsDiff = Math.abs(dif);
    return secondsDiff;
  }

  submit = async () => {
    const { currentVotes } = this.state;

    try {
      const TransactionData = await Client.voteForWitnesses(currentVotes);
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
      const votesFilter = voteList.filter((vote) => {
        return vote.address.match(regex) || vote.url.match(regex);
      });
      this.setState({ voteList: votesFilter });
    } else {
      const data = await Client.getTotalVotes();
      this.setState({ voteList: _.orderBy(data.candidates, ['votes', 'url'], ['desc', 'asc']) || 0 })
    }
  };

  renderItem = (item, index) => {
    const { currentVotes, totalVotes, userVotes } = this.state;
    return (
      <VoteItem
        item={item}
        index={index}
        votes={currentVotes[item.address]}
        userVote={userVotes[item.address]}
        onVoteChange={this.onVoteChange}
        totalVotes={totalVotes}
      />
    );
  }

  renderVoteList = () => {
    const { voteList } = this.state;

    return (
      <div className={styles.wrapperVoteList}>
        <List
          rowKey="id"
          loading={false}
          size="large"
          dataSource={voteList}
          renderItem={this.renderItem}
        />
      </div>
    );
  };

  render() {
    const {
      transaction,
      voteError,
      modalVisible,
      endTime,
      totalVotes,
      totalRemaining,
      totalTrx,
      loading,
      userVotes,
      balance,
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
          <Row type="flex" align="middle">
            <Col sm={8} xs={24} className={styles.blockSeparator}>
              <CowntDownInfo title="Vote cycle ends in" endTime={endTime} />
            </Col>
            <Col sm={8} xs={24} className={styles.blockSeparator}>
              <Info title="Total votes" value={totalVotes.toLocaleString()} />
            </Col>

            <Col sm={8} xs={24}>
              <VoteControl
                totalRemaining={totalRemaining}
                totalFrozen={totalTrx}
                onSubmit={this.submit}
                onResetVotes={this.onResetVotes}
                totalVotes={totalVotes}
                userVotes={userVotes}
                balance={balance}
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
              className={styles.searchVote}
            />
          }
        >
          <p>{voteError}</p>
          {this.renderVoteList()}
        </Card>
        <ModalTransaction
          title="Vote"
          message="Please, validate your transaction"
          onSuccess="Voted successfully"
          loadData={this.onLoadData}
          data={transaction}
          visible={modalVisible}
          txDetails={{ Type: 'VOTE', Amount: totalTrx - totalRemaining }}
          onClose={this.onCloseModal}
        />
      </div>
    );
  }
}

export default connect(({ user }) => ({
  loadWallet: user.loadWallet,
  userWallet: user.userWalletData,
}))(Vote);
