import React, { Component } from 'react';
import {
  Affix,
  Card,
  Row,
  Col,
  List,
  Progress
} from 'antd';

import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';
import styles from './Vote.less';
import votes from '../../utils/wallet-service/votes.json';
import Client from '../../utils/wallet-service/client';

const Info = ({ title, value, bordered }) => (
  <div className={styles.headerInfo}>
    <span>{title}</span>
    <p>{value}</p>
    {bordered && <em />}
  </div>
);

const ListContent = ({ index, url, address }) => (
  <div className={styles.actionContainer}>
    <Row>
      <Col xs={4}>
        <ItemIndex index={index} />
      </Col>
      <Col sm={8} xs={24}>
        <List.Item.Meta
          title={<a href="#">{url}</a>}
          description={address}
        />
      </Col>
    </Row>
  </div>
);

const ItemIndex = ({ index }) => (
  <div className={styles.itemIndex}>
    <strong>#{index}</strong>
  </div>
);

const Header = () => (
  <div className={styles.header}>
    <Row>
      <Col xs={1}>#</Col>
      <Col xs={20}>
        <span className={styles.textLeft}>URL</span>
      </Col>
    </Row>
  </div>
);

const ProgressItem = (props) => {
  // const votesPrecent = ((votes.total_votes / props.votes) * 100);
  const percent = Math.floor((props.votes * 100) / votes.total_votes);
  return (
    <div className={styles.actionContainer}>
      <strong>{props.votes}</strong>
      <Progress percent={percent} status="active" />
    </div>
  )
}

class Vote extends Component {
  state = {
    voteList: [],
    totalTrx: 0,
    totalRemaining: 0,
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

  // #endregion

  render() {
    const { voteList, transaction, voteError, modalVisible } = this.state;
    return (
      <div className={styles.container}>

        <Card bordered={false}>
          <Row>
            <Col sm={8} xs={24}>
              <Info title="我的待办" value="8个任务" bordered />
            </Col>
            <Col sm={8} xs={24}>
              <Info title="本周任务平均处理时间" value="32分钟" bordered />
            </Col>
            <Col sm={8} xs={24}>
              <Info title="本周完成任务数" value="24个任务" />
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
            header={<Header />}
            renderItem={(item, index) => (
              <List.Item
                key={item.id}
                actions={[<ProgressItem votes={item.votes} />]}
              >
                <ListContent index={index + 1} {...item} />
              </List.Item>
            )}
          />
        </Card>

      </div>
    );
  }
}
export default Vote;
