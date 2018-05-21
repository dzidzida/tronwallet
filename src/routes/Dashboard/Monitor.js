import { Card, Col, List, Row, Button, Icon, Spin, Modal } from 'antd';
import ActiveChart from 'components/ActiveChart';
import { ChartCard, Field } from 'components/Charts';
import moment from 'moment';
import { connect } from 'dva';
import React, { Fragment, PureComponent } from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import CopyToClipboard from 'react-copy-to-clipboard';
import { getTronPrice } from '../../services/api';
import Client, { ONE_TRX } from '../../utils/wallet-service/client';
import FreezeModal from '../../components/Freeze/FreezeModal';
import UnfreezeModal from '../../components/Freeze/UnfreezeModal';
import styles from './Monitor.less';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';

class Monitor extends PureComponent {
  state = {
    tronPriceData: [],
    lastDay: {},
    transactionDetail: {},
    freezeModalVisible: false,
    unFreezeModalVisible: false,
    freezeTransaction: '',
    qrcodeVisible: false,
    loading: true,
    loadDataError: false,
  };

  async componentDidMount() {
    await this.loadData();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.user.loadingWallet) {
      this.loadData();
    }
  }

  onOpenPkModal = () => {
    this.props.dispatch({
      type: 'monitor/changeModalPk',
      payload: { visible: true },
    });
  }
  // This  close function from TransactionModal needs to close every modal
  onCloseQRmodal = () => {
    this.setState({
      freezeModalVisible: false,
      unFreezeModalVisible: false,
      qrcodeVisible: false,
    });
  };

  getLastDayFromTronPriceList = (tronPriceList) => {
    const lastTronPrice = tronPriceList[tronPriceList.length - 1];
    return {
      total: `${lastTronPrice.close}`,
      min: lastTronPrice.low,
      max: lastTronPrice.high,
    };
  };

  loadData = async () => {
    try {
      const data = await getTronPrice();
      const { Data: tronPriceList = [] } = data;

      if (!tronPriceList.length) {
        this.setState({ loading: false });
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
        loading: false,
      });
    } catch (error) {
      this.setState({ loadDataError: true, loading: false });
    }
  }

  formatAmount = (number) => {
    return Number((number / ONE_TRX).toFixed(6)).toLocaleString();
  };

  formatAmountTokens = (number) => {
    return Number(number.toFixed(6)).toLocaleString();
  };

  handleFreeze = async (amount) => {
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
    const { totalFreeze: { balances } } = this.props.userWallet;

    if (!balances.length) {
      Modal.error({
        title: 'Something wrong getting balances',
      });
      return;
    }
    if (balances[0].expires > Date.now()) {
      this.setState({
        unFreezeModalVisible: false,
      });
      Modal.error({
        title: 'Unable to Unfreeze',
        content:
          'Unable to unfreeze TRX. This could be caused because the minimal freeze period hasn`t been reached yet',
      });
      return;
    }
    const transactionString = await Client.unfreezeBalance();
    this.setState({
      freezeTransaction: transactionString,
      transactionDetail: { Type: 'UNFREEZE' },
      qrcodeVisible: true,
      unFreezeModalVisible: false,
    });
  };

  renderTokens = () => {
    const { balances, transactionsData } = this.props.userWallet;
    if (balances && transactionsData.transactions.length) {
      return balances.map(bl => (
        <List.Item key={bl.name + bl.balance}>
          <List.Item.Meta title={<span>{bl.name}</span>} />
          <div>{this.formatAmount(bl.balance)}</div>
        </List.Item>
      ));
    }

    return (
      <List.Item>
        <List.Item.Meta title="No tokens found" />
      </List.Item>
    );
  };

  renderTransactions = () => {
    const { transactionsData } = this.props.userWallet;
    if (transactionsData.transactions.length) {
      return transactionsData.transactions.map(tr => (
        <List.Item key={tr.timestamp}>
          <div className={styles.itemRow}>
            <List.Item.Meta
              title={
                <div className={styles.address}>
                  <div>From: {tr.transferFromAddress}</div>
                  <div>To: {tr.transferToAddress}</div>
                </div>
              }
              description={
                <div className={styles.address}>
                  <div className={styles.itemFont}>
                    {new Date(tr.timestamp).getHours()} hours ago
                  </div>
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

    return (
      <List.Item>
        <div className={styles.itemRow}>
          <List.Item.Meta title="No transactions found" />
        </div>
      </List.Item>
    );
  };

  render() {
    const {
      tronPriceData,
      lastDay,
      freezeModalVisible,
      unFreezeModalVisible,
      freezeTransaction,
      qrcodeVisible,
      loading,
      transactionDetail,
      loadDataError,
    } = this.state;

    const { balance, tronAccount, totalFreeze, entropy } = this.props.userWallet;
    const { loadingWallet } = this.props.user;


    if (!tronAccount && !loading && !loadingWallet) {
      return <div />;
    }

    if (loading || loadingWallet) {
      return (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      );
    }
    // Something wrong while getting the api
    if (!this.props.userWallet || loadDataError) {
      return (
        <div className={styles.loading}>
          <Button
            type="primary"
            size="large"
            icon="reload"
            onClick={() => window.location.reload()}
          >Refresh Page
          </Button>
        </div>
      );
    }


    return (
      <Fragment>
        <Row gutter={24}>
          <Col xl={6} lg={24} md={24} sm={24} xs={24}>
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
          <Col xl={6} lg={24} md={24} sm={24} xs={24}>
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
                title="TRX"
                total={Number(balance) ? this.formatAmount(balance) : 'Account not funded'}
                footer={<small>{tronAccount}</small>}
                contentHeight={46}
              />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24}>
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
                title="Tron Power"
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
                  ) : (
                    <Field
                      label=""
                      value={moment(new Date()).format(
                          'dddd, MMMM Do YYYY'
                        )}
                    />
                    )
                }
              />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24}>
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
                    onClick={this.onOpenPkModal}
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
            <Card
              title="ENTROPY"
              style={{ marginBottom: 30 }}
              bordered={false}
              extra={
                <CopyToClipboard text={this.formatAmount(entropy)}>
                  <Button type="primary" size="default" icon="copy" shape="circle" ghost />
                </CopyToClipboard>
              }
            >
              <ChartCard
                bordered={false}
                title="TRX"
                total={this.formatAmount(entropy)}
                footer={<small>{tronAccount}</small>}
                contentHeight={46}
              />
            </Card>
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
            <Card title="OFFICIAL NEWS" bordered={false}>
              <TwitterTimelineEmbed
                sourceType="profile"
                screenName="justinsuntron"
                options={{ height: 900 }}
              />
            </Card>
          </Col>
        </Row>
        <FreezeModal
          visible={freezeModalVisible}
          onClose={() => this.setState({ freezeModalVisible: false })}
          onOk={this.handleFreeze}
        />
        <UnfreezeModal
          freezeBalance={totalFreeze.balances}
          visible={unFreezeModalVisible}
          onClose={() => this.setState({ unFreezeModalVisible: false })}
          onOk={this.handleUnfreeze}
        />
        <ModalTransaction
          title="Freeze amount"
          message="Please, validate your transaction"
          data={freezeTransaction}
          txDetails={transactionDetail}
          visible={qrcodeVisible}
          onClose={this.onCloseQRmodal}
        />
      </Fragment>
    );
  }
}

export default connect(({ user }) => ({
  user,
  userWallet: user.userWalletData,
}))(Monitor);
