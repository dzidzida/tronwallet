import { Card, Col, List, Row, Button, Icon, Spin } from 'antd';
import ActiveChart from 'components/ActiveChart';
import { ChartCard, Field } from 'components/Charts';
import moment from 'moment';
import React, { Fragment, PureComponent } from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import CopyToClipboard from 'react-copy-to-clipboard';
import { getTronPrice } from '../../services/api';
import Client, { ONE_TRX } from '../../utils/wallet-service/client';
import SetPkModal from '../../components/SetPkModal/SetPkModal';
import FreezeModal from '../../components/Freeze/FreezeModal';
import UnfreezeModal from '../../components/Freeze/UnfreezeModal';
import styles from './Monitor.less';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';

class Monitor extends PureComponent {
  state = {
    tronPriceData: [],
    lastDay: {},
    balances: [],
    balance: 0,
    tronAccount: '',
    transactionsData: [],
    transactionDetail: {},
    modalVisible: false,
    freezeModalVisible: false,
    unFreezeModalVisible: false,
    freezeTransaction: '',
    qrcodeVisible: false,
    totalFreeze: 0,
    loading: true,
  };

  async componentDidMount() {
    await this.loadData();
  }

  onOpenModal = () => this.setState({ modalVisible: true });

  onCloseModal = () => this.setState({ modalVisible: false, qrcodeVisible: false });

  getLastDayFromTronPriceList = tronPriceList => {
    const lastTronPrice = tronPriceList[tronPriceList.length - 1];
    return {
      total: `${lastTronPrice.close}`,
      min: lastTronPrice.low,
      max: lastTronPrice.high,
    };
  };

  loadData = async () => {
    const data = await Promise.all([
      getTronPrice(),
      Client.getBalances(),
      Client.getPublicKey(),
      Client.getTransactionList(),
      Client.getFreeze(),
    ]);

    const { Data: tronPriceList = [] } = data[0];
    const balances = data[1];
    const tronAccount = data[2];
    const { balance } = balances.find(b => b.name === 'TRX');
    const transactionsData = data[3];
    const frozen = data[4];

    if (!tronPriceList.length) {
      return;
    }

    const tronPriceData = tronPriceList.map(price => ({
      x: `${moment.unix(price.time).format('YYYY-MM-DD HH:mm')}`,
      y: price.close,
    }));

    const lastDay = this.getLastDayFromTronPriceList(tronPriceList);

    this.setState({
      tronPriceData,
      lastDay,
      balance,
      balances,
      tronAccount,
      transactionsData,
      totalFreeze: frozen,
      loading: false,
    });
  };

  formatAmount = number => {
    return Number((number / ONE_TRX).toFixed(6)).toLocaleString();
  };

  formatAmountTokens = number => {
    return Number(number.toFixed(6)).toLocaleString();
  };

  handleFreeze = async amount => {
    const transactionString = await Client.freezeBalance(amount);
    if (transactionString) {
      this.setState({
        transactionDetail: { Type: 'FREEZE', Amount: amount },
        freezeTransaction: transactionString,
        qrcodeVisible: true,
        freezeModalVisible: false,
      });
    }
  };

  handleUnfreeze = async () => {
    const transactionString = await Client.unfreezeBalance();
    if (transactionString) {
      this.setState({
        freezeTransaction: transactionString,
        transactionDetail: { Type: 'UNFREEZE' },
        qrcodeVisible: true,
        unFreezeModalVisible: false,
      });
    }
  };

  renderTokens = () => {
    const { balances } = this.state;
    return balances.map(bl => (
      <List.Item key={bl.name + bl.balance}>
        <List.Item.Meta title={<span>{bl.name}</span>} />
        <div>{this.formatAmount(bl.balance)}</div>
      </List.Item>
    ));
  };

  renderTransactions = () => {
    const { transactionsData } = this.state;
    if (transactionsData.transactions) {
      return transactionsData.transactions.map(tr => (
        <List.Item key={tr.timestamp}>
          <div className={styles.itemRow}>
            <List.Item.Meta
              title={
                <div className={styles.address}>
                  <small>From: {tr.transferFromAddress}</small>
                  <small>To: {tr.transferToAddress}</small>
                </div>
              }
              description={
                <div className={styles.address}>
                  <small className={styles.itemFont}>
                    {new Date(tr.timestamp).getHours()} hours ago
                  </small>
                </div>
              }
            />

            <div>
              <small className={styles.itemFont}>
                {this.formatAmount(tr.amount)}
                {tr.tokenName}
                {tr.transferFromAddress === transactionsData.owner ? (
                  <Icon type="caret-down" style={{ marginLeft: 5, color: 'red' }} />
                ) : (
                  <Icon type="caret-up" style={{ marginLeft: 5, color: 'green' }} />
                )}
              </small>
            </div>
          </div>
        </List.Item>
      ));
    }
  };

  render() {
    const {
      tronPriceData,
      lastDay,
      balance,
      tronAccount,
      modalVisible,
      freezeModalVisible,
      unFreezeModalVisible,
      freezeTransaction,
      qrcodeVisible,
      totalFreeze,
      loading,
      transactionDetail,
    } = this.state;

    if (loading) {
      return (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      );
    }

    return (
      <Fragment>
        <Row gutter={24}>
          <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card
              title="TRX PRICE"
              style={{ marginBottom: 24 }}
              bordered={false}
              extra={
                <CopyToClipboard
                  text={tronPriceData.length ? tronPriceData[tronPriceData.length - 1].y : ''}
                >
                  <Button type="primary" size="default" icon="copy" shape="circle" ghost />
                </CopyToClipboard>
              }
            >
              <ActiveChart data={tronPriceData} lastDay={lastDay} />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card
              title="BALANCE"
              style={{ marginBottom: 30 }}
              bordered={false}
              extra={
                <CopyToClipboard text={this.formatAmount(balance)}>
                  <Button type="primary" size="default" icon="copy" shape="circle" ghost />
                </CopyToClipboard>
              }
            >
              <ChartCard
                bordered={false}
                title="TRX "
                total={this.formatAmount(balance)}
                footer={<Field label={moment(new Date()).format('dddd, MMMM Do YYYY')} />}
                contentHeight={46}
              />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card
              title="FROZEN TOKENS"
              style={{ marginBottom: 30 }}
              bordered={false}
              extra={
                <Fragment>
                  <Button
                    type="danger"
                    size="default"
                    ghost
                    icon="close"
                    shape="circle"
                    onClick={() => this.setState({ unFreezeModalVisible: true })}
                  />
                  {'  '}
                  <Button
                    type="primary"
                    size="default"
                    icon="check"
                    shape="circle"
                    ghost
                    onClick={() => this.setState({ freezeModalVisible: true })}
                  />
                </Fragment>
              }
            >
              <ChartCard
                bordered={false}
                title="Amount"
                total={
                  <span style={{ fontSize: 26 }}>
                    {this.formatAmountTokens(totalFreeze.total || 0)}
                  </span>
                }
                contentHeight={46}
                footer={
                  totalFreeze.balances && totalFreeze.balances.length ? (
                    <Field
                      label="Expires"
                      value={moment(new Date(totalFreeze.balances[0].expires)).format(
                        'dddd, MMMM Do YYYY'
                      )}
                    />
                  ) : null
                }
              />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card
              title="MY TRON ACCOUNT"
              style={{ marginBottom: 30 }}
              bordered={false}
              extra={
                <Fragment>
                  <Button
                    type="danger"
                    size="default"
                    ghost
                    icon="edit"
                    shape="circle"
                    onClick={this.onOpenModal}
                  />
                  {'    '}
                  <CopyToClipboard text={tronAccount}>
                    <Button type="primary" size="default" icon="copy" shape="circle" ghost />
                  </CopyToClipboard>
                </Fragment>
              }
            >
              <ChartCard
                bordered={false}
                title="Address"
                total={<small style={{ fontSize: 12 }}>{tronAccount}</small>}
                footer={<Field label={moment(new Date()).format('dddd, MMMM Do YYYY')} />}
                contentHeight={46}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xl={6} lg={24} md={24} sm={24} xs={24}>
            <Card title="TOKENS" style={{ marginBottom: 16 }} bordered={false}>
              {this.renderTokens()}
            </Card>
          </Col>
          <Col xl={12} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card title="TRANSACTIONS" style={{ marginBottom: 16 }} bordered={false}>
              {this.renderTransactions()}
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24}>
            <Card title="OFFICIAL NEWS" style={{ marginBottom: 16 }} bordered={false}>
              <TwitterTimelineEmbed
                sourceType="profile"
                screenName="justinsuntron"
                options={{ height: 600 }}
              />
            </Card>
          </Col>
        </Row>
        <SetPkModal visible={modalVisible} onClose={this.onCloseModal} loadData={this.loadData} />
        <FreezeModal
          visible={freezeModalVisible}
          onClose={() => this.setState({ freezeModalVisible: false })}
          onOk={this.handleFreeze}
        />
        <UnfreezeModal
          visible={unFreezeModalVisible}
          onClose={() => this.setState({ unFreezeModalVisible: false })}
          onOk={this.handleUnfreeze}
        />
        <ModalTransaction
          title="Freeze amount"
          message="Please, validate your transaction"
          data={freezeTransaction}
          txDetail={transactionDetail}
          visible={qrcodeVisible}
          onClose={this.onCloseModal}
        />
      </Fragment>
    );
  }
}

export default Monitor;
