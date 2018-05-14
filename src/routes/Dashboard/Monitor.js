import { Card, Col, List, Row, Button, Icon } from 'antd';
import ActiveChart from 'components/ActiveChart';
import { ChartCard, Field } from 'components/Charts';
import moment from 'moment';
import React, { Fragment, PureComponent } from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import CopyToClipboard from 'react-copy-to-clipboard';
import { getTronPrice } from '../../services/api';
import Client from '../../utils/wallet-service/client';
import SetPkModal from '../../components/SetPkModal/SetPkModal';
import FreezeModal from '../../components/Freeze/FreezeModal';
import UnfreezeModal from '../../components/Freeze/UnfreezeModal';
import styles from './Monitor.less';

class Monitor extends PureComponent {
  state = {
    tronPriceData: [],
    lastDay: {},
    balances: [],
    balance: 0,
    tronAccount: '',
    transactionsData: [],
    modalVisible: false,
    freezeModalVisible: false,
    unFreezeModalVisible: false,
  };

  async componentDidMount() {
    await this.loadData();
  }

  onOpenModal = () => this.setState({ modalVisible: true });

  onCloseModal = () => this.setState({ modalVisible: false });

  getLastDayFromTronPriceList = tronPriceList => {
    const lastTronPrice = tronPriceList[tronPriceList.length - 1];
    return {
      total: `${lastTronPrice.close}`,
      min: lastTronPrice.low,
      max: lastTronPrice.high,
    };
  };

  loadData = async () => {
    const { Data: tronPriceList = [] } = await getTronPrice();
    const balances = await Client.getBalances();
    const tronAccount = await Client.getPublicKey();
    const { balance } = balances.find(b => b.name === 'TRX');
    const transactionsData = await Client.getTransactionList();

    if (!tronPriceList.length) {
      return;
    }

    const tronPriceData = tronPriceList.map(price => ({
      x: `${moment.unix(price.time).format('YYYY-MM-DD HH:mm')}`,
      y: price.close,
    }));

    const lastDay = this.getLastDayFromTronPriceList(tronPriceList);

    this.setState({ tronPriceData, lastDay, balance, balances, tronAccount, transactionsData });
  };

  formatBalance = balance => {
    return Number(balance).toLocaleString('en', {});
  };

  renderTokens = () => {
    const { balances } = this.state;
    return balances.map(bl => (
      <List.Item key={bl.name + bl.balance}>
        <List.Item.Meta title={<span>{bl.name}</span>} />
        <div>{this.formatBalance(bl.balance)}</div>
      </List.Item>
    ));
  };

  renderTransactions = () => {
    const { transactionsData } = this.state;
    if (transactionsData.transactions) {
      return transactionsData.transactions.map(tr => (
        <List.Item key={tr.timestamp}>
          <div className={styles.itemRow}>
            <div>
              <small className={styles.itemFont}>
                {new Date(tr.timestamp).getHours()} hours ago
              </small>
            </div>

            <div className={styles.address}>
              <small>{tr.transferFromAddress}</small>
              <small>{tr.transferToAddress}</small>
            </div>

            <div>
              <small className={styles.itemFont}>
                {this.formatBalance(tr.amount)}
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
    const { tronPriceData, lastDay, balance, tronAccount, modalVisible, freezeModalVisible, unFreezeModalVisible } = this.state;
    return (
      <Fragment>
        <Row gutter={24}>
          <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card
              title="TRON Price"
              style={{ marginBottom: 24 }}
              bordered={false}
              extra={
                <CopyToClipboard text={tronPriceData.length ? tronPriceData[tronPriceData.length - 1].y : ''}>
                  <Button type="primary" size="default" icon="copy" shape="circle" ghost />
                </CopyToClipboard>
              }
            >
              <ActiveChart data={tronPriceData} lastDay={lastDay} />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card
              title="TRX BALANCE"
              style={{ marginBottom: 30 }}
              bordered={false}
              extra={
                <CopyToClipboard text={this.formatBalance(balance)}>
                  <Button type="primary" size="default" icon="copy" shape="circle" ghost />
                </CopyToClipboard>
              }
            >
              <ChartCard
                bordered={false}
                title="TRX Avaliable"
                total={this.formatBalance(balance)}
                footer={<Field label={moment(new Date()).format('DD-MM-YYYY HH:mm:ss')} />}
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
                total={199}
                contentHeight={46}
                footer={
                  <Field label="Expires" value={moment(new Date()).format('DD-MM-YYYY HH:mm:ss')} />
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
                total={tronAccount}
                footer={<Field label={tronAccount} />}
                contentHeight={46}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xl={9} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card title="TOKENS" style={{ marginBottom: 24 }} bordered={false}>
              {this.renderTokens()}
            </Card>
          </Col>
          <Col xl={9} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card title="TRANSACTIONS" style={{ marginBottom: 24 }} bordered={false}>
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
        <SetPkModal visible={modalVisible} onClose={this.onCloseModal} />
        <FreezeModal visible={freezeModalVisible} onClose={() => this.setState({ freezeModalVisible: false })} />
        <UnfreezeModal visible={unFreezeModalVisible} onClose={() => this.setState({ unFreezeModalVisible: false })} />
      </Fragment>
    );
  }
}

export default Monitor;
