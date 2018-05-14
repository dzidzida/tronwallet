import React, { Component } from 'react';
import { Affix, Card, Row, Col, List } from 'antd';
import moment from 'moment';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';
import styles from './Vote.less';
import votes from '../../utils/wallet-service/votes.json';
import Client from '../../utils/wallet-service/client';
import CowntDownInfo from './CowntDownInfo';

const Info = ({ title, value, bordered }) => (
  <div className={styles.headerInfo}>
    <span>{title}</span>
    <p>{value}</p>
    {bordered && <em />}
  </div>
);

const ListContent = ({ data: { owner, createdAt, percent, status } }) => (
  <div className={styles.listContent}>
    <div className={styles.listContentItem}>
      <span>Owner</span>
      <p>{owner}</p>
    </div>
    <div className={styles.listContentItem}>
      <span>开始时间</span>
      <p>{moment(createdAt).format('YYYY-MM-DD HH:mm')}</p>
    </div>
    <div className={styles.listContentItem}>
      <Progress percent={percent} status={status} strokeWidth={6} style={{ width: 180 }} />
    </div>
  </div>
);

// const MoreBtn = () => (
//   <Dropdown overlay={menu}>
//     <a>
//       更多 <Icon type="down" />
//     </a>
//   </Dropdown>
// );

class Vote extends Component {
  state = {
    voteList: [],
    totalTrx: 0,
    totalRemaining: 0,
    endTime: null,
    totalVotes: 0,
    transaction: {
      loading: false,
      status: false,
      qrcode: null,
      error: null,
    },
  };

  componentDidMount() {
    this.onLoadWitness();
    this.onLoadAvailable();
    this.onLoadEndTime();
    this.onLoadTotalVotes();
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
    const { voteList, transaction, voteError, modalVisible, endTime, totalVotes } = this.state;
    return (
      <div className={styles.container}>
        <Card bordered={false}>
          <Row className={styles.blockSeparator}>
            <Col sm={8} xs={24}>
              <CowntDownInfo title="Vote cycle ends in" endTime={endTime} bordered />
            </Col>
            <Col sm={8} xs={24}>
              <Info title="Total votes" value={totalVotes} bordered />
            </Col>
          </Row>
        </Card>

        <List
          size="large"
          rowKey="id"
          loading={false}
          dataSource={votes}
          renderItem={item => <List.Item>asdasdasasasd</List.Item>}
        />
      </div>
    );
  }
}
export default Vote;
