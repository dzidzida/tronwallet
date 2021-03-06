import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Modal, Spin, Progress, Row, Col, Card, InputNumber } from 'antd';
import moment from 'moment';
import styles from './View.less';
import Client, { ONE_TRX } from '../../utils/wallet-service/client';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';
import RefreshButton from '../../components/RefreshButton/RefreshButton';

class View extends PureComponent {
  state = {
    modalVisible: false,
    currentToken: null,
    amount: 0,
    tokenName: 'TRX',
    issuerAddress: null,
    tokenList: [],
    acceptTerms: false,
    participateError: null,
    transactionData: {},
    loading: true,
    error: false,
    loadingError: false,
    isParticipateModalVisible: false,
  };

  componentDidMount() {
    this.loadTokens();
  }

  onChange = (e) => {
    if ((typeof e === 'number')) {
      this.setState({
        amount: e,
      });
    } else if ((typeof e === 'string') || (typeof e === undefined)) {
      this.setState({
        amount: 0,
      });
    } else {
      const { name, value, type, checked } = e.target;
      this.setState({
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  onParticipate = (token) => {
    this.setState({
      currentToken: token,
      tokenName: token.name,
      amount: 0,
      acceptTerms: false,
      issuerAddress: token.ownerAddress,
    }, () => {
      this.setState({ isParticipateModalVisible: true });
    });
  };

  onCloseModal = () => {
    this.setState({ modalVisible: false, loading: true, currentToken: null, isParticipateModalVisible: false });
    this.loadTokens();
  };

  submit = async (e) => {
    e.preventDefault();
    const { tokenName, amount, issuerAddress } = this.state;

    try {
      const transactionData = await Client.participateToken({
        token: tokenName,
        amount,
        issuerAddress,
      });
      this.setState({ transactionData, modalVisible: true });
    } catch (error) {
      this.setState({ error: 'Something wrong participating for Token' });
    } finally {
      this.setState({ loading: false });
    }
  };

  loadTokens = async () => {
    try {
      const { tokenList } = await Client.getTokensList();
      this.setState({ tokenList, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };

  selectToken = (tokenId) => {
    this.setState({ currentToken: tokenId });
  };

  renderParticipateButton = (token) => {
    if (moment(token.startTime).isAfter()
      || moment(token.endTime).isBefore()
      || token.percentage === 100) {
      return (
        <Button type="primary" icon="close-circle-o" disabled>Finished</Button>
      );
    } else {
      return (
        <Button type="primary" icon="like" onClick={() => this.onParticipate(token)}>
          Participate
        </Button>
      );
    }
  };

  renderCollapse = () => {
    const { currentToken, amount, acceptTerms, error } = this.state;

    if (currentToken) {
      return (
        <div>
          <Row>
            <Col span={8}>
              <h3 className={styles.item}>
                <b>Name</b>
              </h3>
            </Col>
            <Col span={16} style={{ textAlign: 'right' }}>
              {currentToken.name}
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <h3 className={styles.item}>
                <b>Description</b>
              </h3>
            </Col>
            <Col span={16} style={{ textAlign: 'right' }}>
              {currentToken.description}
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <h3 className={styles.item}>
                <b>Price</b>
              </h3>
            </Col>
            <Col span={16} style={{ textAlign: 'right' }}>
              {Number(currentToken.price / ONE_TRX).toFixed(2)} TRX
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <h3 className={styles.item}>
                <b>Amount</b>
              </h3>
            </Col>
            <Col span={16} style={{ textAlign: 'right' }}>
              <InputNumber
                min={0}
                step={10}
                value={amount}
                onChange={this.onChange}
              />
            </Col>
          </Row>
          <br />
          <Row>
            <Col span={20} >
              I&#39;ve confirmed to spend{' '}
              <b>{((amount * currentToken.price) / ONE_TRX).toFixed(2)} TRX</b> on token
              distribution, and get a total of{' '}
              <b>
                {amount} {currentToken.name}
              </b>{' '}
              tokens.
            </Col>
            <Col span={4} style={{ textAlign: 'right' }}>
              <input
                onChange={this.onChange}
                type="checkbox"
                name="acceptTerms"
                value={acceptTerms}
              />
            </Col>
          </Row>
          <Row>
            <p className={styles.error}>{error}</p>
          </Row>
        </div>
      );
    }
    return null;
  };

  renderToken = () => {
    return this.state.tokenList.map((token) => {
      const totalPercentage = parseFloat((token.percentage).toFixed(2));
      return (
        <Col span={6} style={{ padding: 8 }} key={`${token.name}-${Date.now()}`}>
          <Card
            key={`${token.name}-${Date.now()}`}
            title={token.name}
            extra={
              <div>
                {`Ends in ${moment(token.endTime).diff(new Date(), 'day') + 1} days`}
              </div>
            }
          >
            <Row>
              <Row>
                <Col span={20}>
                  {`${token.issued} / ${token.totalSupply}`}
                </Col>
                <Col span={4} style={{ textAlign: 'right' }}>
                  {`${totalPercentage}%`}
                </Col>
              </Row>
              <Row>
                <Progress
                  status="success"
                  percent={totalPercentage}
                  showInfo={false}
                />
              </Row>
            </Row>
            <Row>
              <br />
              <div style={{ width: '100%', textAlign: 'center' }}>{this.renderParticipateButton(token)}</div>
            </Row>
            {/* {this.renderCollapse(token.ownerAddress)} */}
          </Card>
        </Col>
      );
    });
  };

  render() {
    const {
      transactionData,
      loading,
      modalVisible,
      participateError,
      amount,
      issuerAddress,
      tokenName,
      isParticipateModalVisible,
      tokenList,
      loadingError,
    } = this.state;

    if (loading) {
      return (
        <div className={styles.container} >
          <Spin size="large" />
        </div>
      );
    }

    if (loadingError) return <RefreshButton />;

    if (!tokenList.length) {
      return (
        <div className={styles.emptyList}>
          <Button disabled>No tokens available</Button>
        </div>
      );
    }

    return (
      <Fragment>
        {this.renderToken()}
        <h3 className={styles.error}>{participateError}</h3>
        <Modal
          title="Participate"
          visible={isParticipateModalVisible}
          onCancel={() => this.setState({ isParticipateModalVisible: false }, () => this.setState({ currentToken: null }))}
          onOk={this.submit}
          okText="Confirm Participation"
        >
          {this.renderCollapse()}
        </Modal>
        <ModalTransaction
          title="Participate to asset"
          message="Please, validate your transaction"
          onSuccess="Participated to token sucessfully"
          data={transactionData}
          visible={modalVisible}
          onClose={this.onCloseModal}
          txDetails={{
            Type: 'PARTICIPATE',
            Amount: amount,
            Issuer: issuerAddress,
            Token: tokenName,
          }}
        />
      </Fragment>
    );
  }
}

export default connect()(View);
