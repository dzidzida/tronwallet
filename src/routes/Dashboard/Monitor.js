import { Card, Col, List, Row, Button, Spin, Modal, Tag } from 'antd';
import ActiveChart from 'components/ActiveChart';
import { ChartCard, Field } from 'components/Charts';
import moment from 'moment';
import uuid from 'uuid/v4';
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
import PublicKeyModal from '../../components/PublicKeyModal/PublicKeyModal';
import Contract from '../../components/Contract/Contract';
import FreezeInfo from '../../components/InfoModal/FreezeInfo';
import BandwidthInfo from '../../components/InfoModal/BandwidthInfo';
import CreateTokenInfo from '../../components/InfoModal/CreateTokenInfo';
import RefreshButton from '../../components/RefreshButton/RefreshButton';

class Monitor extends PureComponent {
  state = {
    tronPriceData: [],
    lastDay: {},
    transactionDetail: {},
    freezeModalVisible: false,
    unFreezeModalVisible: false,
    freezeTransaction: '',
    qrcodeVisible: false,
    publicKeyModalVisible: false,
    loading: true,
    loadDataError: false,
    freezeInfo: false,
    bandwidthInfo: false,
    createTokenInfo: false,
  };

  componentDidMount() {
    this.loadData();
  }

  onOpenPkModal = () => {
    this.props.dispatch({
      type: 'monitor/changeModalPk',
      payload: { visible: true },
    });
  }

  onOpenPkModalFromQRCode = (pk) => {
    this.props.dispatch({
      type: 'monitor/changeModalPk',
      payload: { visible: true, pk },
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

  fetchWalletData = async () => {
    this.props.dispatch({
      type: 'user/fetchWalletData',
    });
  }

  formatAmount = (number) => {
    return Number((number / ONE_TRX).toFixed(6)).toLocaleString();
  };

  formatAmountTokens = (number) => {
    return Number(number.toFixed(6)).toLocaleString();
  };

  handleFreeze = async (amount) => {
    const transactionString = await Client.freezeBalance(Number(amount));
    if (transactionString) {
      this.setState({
        transactionDetail: { Type: 'FREEZE', Amount: Number(amount) },
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
    if (balances && transactionsData) {
      return balances.map(bl => (
        <List.Item key={`${bl.name}-${bl.balance}`}>
          <List.Item.Meta title={<Tag color="#333333">{bl.name}</Tag>} />
          <div>{this.formatAmountTokens(bl.balance)}</div>
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
      return transactionsData.transactions.map(tx => (
        <List.Item key={`${tx.timestamp}-${uuid()}`}>
          <div className={styles.itemRow}>
            <Contract transaction={tx} />
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
      freezeInfo,
      bandwidthInfo,
      createTokenInfo,
      publicKeyModalVisible,
    } = this.state;

    const { balance, tronAccount, totalFreeze, bandwidth } = this.props.userWallet;
    const { loadingWallet, walletError } = this.props.user;
    // console.log('totalFreeze',totalFreeze)
    // If user doesnt have a PK yet

    if (loading || loadingWallet) {
      return (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      );
    }

    if (!tronAccount) return <div />;

    // Something wrong while getting the api
    if (!this.props.userWallet || loadDataError || walletError) {
      return <RefreshButton />;
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
              title="BANDWIDTH"
              style={{ marginBottom: 30 }}
              bordered={false}
              extra={
                <Button type="primary" size="default" icon="question" shape="circle" ghost onClick={() => this.setState({ bandwidthInfo: true })} />
              }
            >
              <ChartCard
                bordered={false}
                title="TRX"
                total={this.formatAmountTokens(bandwidth)}
                footer={<small style={{ color: '#fff' }}>.</small>}
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
                <Button
                  type="primary"
                  size="default"
                  icon="question"
                  shape="circle"
                  ghost
                  onClick={() => this.setState({ freezeInfo: true })}
                />
              }
            >
              <ChartCard
                bordered={false}
                title="Tron Power"
                total={this.formatAmount(totalFreeze.total || 0)}
                contentHeight={46}
                footer={
                  totalFreeze.balances && totalFreeze.balances.total ? (
                    <Field
                      label="Expires"
                      value={moment(new Date(totalFreeze.balances[0].expires)).format(
                        'dddd, MMMM Do YYYY'
                      )}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Field
                        label=""
                        value={moment(new Date()).format(
                            'dddd, MMMM Do YYYY'
                          )}
                      />
                      <div>
                        <Button
                          type="danger"
                          size="small"
                          ghost
                          icon="close"
                          shape="circle"
                          onClick={() => this.setState({ unFreezeModalVisible: true })}
                          disabled={balance === 0}
                        />
                        {'  '}
                        <Button
                          type="primary"
                          size="small"
                          icon="check"
                          shape="circle"
                          ghost
                          onClick={() => this.setState({ freezeModalVisible: true })}
                          disabled={balance === 0}
                        />
                      </div>
                    </div>
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
                    type="primary"
                    size="default"
                    ghost
                    icon="qrcode"
                    shape="circle"
                    onClick={() => this.setState({ publicKeyModalVisible: true })}
                  />
                  {'    '}
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
              title="BALANCE"
              style={{ marginBottom: 30 }}
              bordered={false}
              extra={
                <Button type="primary" size="default" icon="reload" shape="circle" ghost onClick={() => this.fetchWalletData()} />
              }
            >
              <ChartCard
                bordered={false}
                title="TRX"
                total={Number(balance) ? this.formatAmount(balance) : '0'}
                footer={<small style={{ color: '#fff' }}>.</small>}
                contentHeight={46}
              />
            </Card>

            <Card
              title="TOKENS"
              style={{ marginBottom: 16 }}
              bordered={false}
              extra={
                <Button type="primary" size="default" icon="question" shape="circle" ghost onClick={() => this.setState({ createTokenInfo: true })} />
              }
            >
              {this.renderTokens()}
            </Card>
          </Col>
          <Col xl={12} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card
              title="TRANSACTIONS"
              style={{ marginBottom: 16 }}
              bordered={false}
              extra={
                <Button type="primary" size="default" icon="reload" shape="circle" ghost onClick={() => this.fetchWalletData()} />
              }
            >
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
          onSuccess={`Transaction ${transactionDetail.Type} succesfull`}
          data={freezeTransaction}
          txDetails={transactionDetail}
          visible={qrcodeVisible}
          onClose={this.onCloseQRmodal}
        />
        <PublicKeyModal
          title="Public key"
          visible={publicKeyModalVisible}
          onClose={() => this.setState({ publicKeyModalVisible: false })}
          onScan={data => this.onOpenPkModalFromQRCode(data)}
        />
        <FreezeInfo
          visible={freezeInfo}
          onClose={() => this.setState({ freezeInfo: false })}
        />
        <BandwidthInfo
          visible={bandwidthInfo}
          onClose={() => this.setState({ bandwidthInfo: false })}
        />
        <CreateTokenInfo
          visible={createTokenInfo}
          onClose={() => this.setState({ createTokenInfo: false })}
        />
      </Fragment>
    );
  }
}

export default connect(({ user, monitor }) => ({
  user,
  userWallet: user.userWalletData,
  pkFromQrCode: monitor.pkFromQrCode,
}))(Monitor);
