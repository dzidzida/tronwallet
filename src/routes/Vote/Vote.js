import React, { Component } from 'react';
import { Card, Row, Col, List, Spin, Input, Button, InputNumber } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';

import styles from './Vote.less';
import Client from '../../utils/wallet-service/client';
import CowntDownInfo from './CowntDownInfo';
import ListContent from './../../components/Vote/ListContent';
import ProgressItem from './../../components/Vote/ProgessItem';
import VoteControl from './../../components/Vote/VoteControl';
// import VoteSlider from './../../components/Vote/VoteSlider';

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
    // isReset: true,
    loading: true,
    userVotes: {},
    balance: 0,
  };

  // #region logic
  componentDidMount() {
    this.onLoadData();
    this.onLoadEndTime();
  }

  componentWillReceiveProps(nextProps) {
    const { totalFreeze } = nextProps.userWallet;
    if (totalFreeze && totalFreeze.total > 0) {
      const totalTrx = totalFreeze.total;
      this.setState({ totalTrx, totalRemaining: totalTrx });
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

  onResetVotes = (address) => {
    const { voteList, totalTrx } = this.state;
    if (address) {
      delete voteList.find(v => v.address === address).amount;
      // this.setState({ voteList, isReset: true }, () => {
      this.setState({ voteList }, () => {
        const totalVotes = this.state.voteList.reduce((prev, vote) => {
          return Number(prev) + Number(vote.amount || 0);
        }, 0);
        this.setState({ totalRemaining: totalTrx - totalVotes });
      });
    } else {
      voteList.filter(v => v.amount).forEach((v) => {
        const vt = v;
        delete vt.amount;
      });
      // this.setState({ voteList, totalRemaining: totalTrx, isReset: true });
      this.setState({ voteList, totalRemaining: totalTrx });
    }
  };

  onVoteChange = (address, value, max) => {
    const { voteList, totalTrx } = this.state;
    const findAddressAmount = voteList.find(v => v.address === address).amount;

    if (!max) {
      voteList.find(v => v.address === address).amount = value;
    } else if (findAddressAmount) {
      voteList.find(v => v.address === address).amount += value;
    } else {
      voteList.find(v => v.address === address).amount = value;
    }

    // this.setState({ voteList, isReset: false }, () => {
    this.setState({ voteList }, () => {
      const totalVotes = this.state.voteList.reduce((prev, vote) => {
        return Number(prev) + Number(vote.amount || 0);
      }, 0);
      this.setState({ totalRemaining: totalTrx - totalVotes });
    });
  };

  submit = async () => {
    const { voteList } = this.state;
    const votesPrepared = {};
    voteList.forEach((vote) => {
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
      const votesFilter = voteList.filter((vote) => {
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
    const percent = ((totalTrx - totalRemaining) / totalTrx) * 100;
    if (totalRemaining < 0) {
      return <div className={styles.progressBarDanger} style={{ width: '100%' }} />;
    } else if (totalRemaining === 0) {
      return <div className={styles.progressBarSuccess} style={{ width: '100%' }} />;
    }
    return <div className={styles.progressBar} style={{ width: `${percent}%` }} />;
  };
  // #endregion

  renderVoteList = () => {
    const { voteList, totalVotes, totalRemaining, totalTrx } = this.state;

    return (
      <div className={styles.wrapperVoteList}>
        <List
          rowKey="id"
          loading={false}
          size="large"
          dataSource={voteList}
          renderItem={(item, index) => (
            <List.Item
              key={item.address}
              actions={[
                <div className={styles.listItemRow}>
                  <div style={{ margin: 15 }}>
                    <ProgressItem votes={Number(item.votes)} total={totalVotes} />
                  </div>
                  <div style={{ margin: 15 }}>
                    {/* <VoteSlider
                      onVoteChange={v => this.onVoteChange(item.address, v, false)}
                      totalTrx={totalTrx}
                      isReset={isReset}
                      isMax={item.amount || 0}
                    /> */}
                    <InputNumber
                      min={0}
                      max={totalTrx}
                      step={10}
                      defaultValue={0}
                      placeholder="0"
                      value={item.amount}
                      formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      onChange={v => this.onVoteChange(item.address, v, false)}
                    />
                  </div>
                  <div className={styles.smallButtonsContainer}>
                    <Button
                      className={styles.smallButtons}
                      style={{ marginBottom: 5 }}
                      type="primary"
                      size="small"
                      onClick={() => this.onVoteChange(item.address, totalRemaining, true)}
                      icon="to-top"
                    >
                      Máx
                    </Button>
                    <Button
                      className={styles.smallButtons}
                      size="small"
                      onClick={() => this.onResetVotes(item.address)}
                      icon="close-circle-o"
                    >
                      Reset
                    </Button>
                  </div>
                </div>,
              ]}
            >
              <ListContent index={index + 1} {...item} />
            </List.Item>
          )}
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
                totalTrx={totalTrx}
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
