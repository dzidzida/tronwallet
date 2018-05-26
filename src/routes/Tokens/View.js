import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Spin, Progress } from 'antd';
import moment from 'moment';
import styles from './View.less';
import Client, { ONE_TRX } from '../../utils/wallet-service/client';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';

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
  };

  componentDidMount() {
    this.loadTokens();
  }

  onChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState({
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  onClick = (token) => {
    this.setState({
      currentToken: token,
      tokenName: token.name,
      amount: 0,
      acceptTerms: false,
      issuerAddress: token.ownerAddress,
    });
  };

  onCloseModal = () => {
    this.setState({ modalVisible: false, loading: true, currentToken: null });
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
        <button disabled className={styles.close}>
          {moment(token.startTime).isAfter() ? 'Not started' : 'Finished'}
        </button>
      );
    } else {
      return (
        <button className={styles.participate} onClick={() => this.onClick(token)}>
          Participate
        </button>
      );
    }
  };

  renderCollapse = (ownerAddress) => {
    const { currentToken, amount, acceptTerms, loading, error } = this.state;

    if (currentToken && currentToken.ownerAddress === ownerAddress) {
      return (
        <tr>
          <td colSpan="5" className={styles.collapse}>
            <div className={styles.collapseRow}>
              <h3 className={styles.item}>
                <b>Description</b>
              </h3>
              <h3 className={styles.item}>{currentToken.description}</h3>
            </div>
            <div className={styles.collapseRow}>
              <h3 className={styles.item}>
                <b>Price</b>
              </h3>
              <h3 className={styles.item}>{Number(currentToken.price / ONE_TRX).toFixed(2)} TRX</h3>
            </div>
            <div className={styles.collapseRow}>
              <h3 className={styles.item}>
                <b>Amount</b>
              </h3>
              <input
                className={styles.amount}
                name="amount"
                type="number"
                min="0"
                onChange={this.onChange}
              />
            </div>
            <div className={styles.collapseRow}>
              <input
                onChange={this.onChange}
                type="checkbox"
                name="acceptTerms"
                value={acceptTerms}
              />
              <span className={styles.checkboxText}>
                I&#39;ve confirmed to spend{' '}
                <b>{((amount * currentToken.price) / ONE_TRX).toFixed(2)} TRX</b> on token
                distribution, and get a total of{' '}
                <b>
                  {amount} {currentToken.name}
                </b>{' '}
                tokens.
              </span>
            </div>
            <div className={styles.collapseRow}>
              <button
                className={styles.transaction}
                onClick={this.submit}
                disabled={!acceptTerms || loading}
              >
                Confirm transaction
              </button>
            </div>
            <p className={styles.error}>{error}</p>
          </td>
        </tr>
      );
    }
    return null;
  };

  renderToken = () => {
    return this.state.tokenList.map((token) => {
      return (
        <Fragment key={token.name}>
          <tr>
            <td>{token.name}</td>
            <td>{token.ownerAddress}</td>
            <td className={styles.right}>
              <p>{token.issued} / {token.totalSupply}</p>
              <span style={{ display: 'block' }}>
                <Progress
                  percent={token.percentage}
                  showInfo={false}
                />
              </span>
            </td>
            <td>
              <span style={{ display: 'block' }}>
                {moment(token.startTime).format('DD-MM-YYYY HH:MM')}
              </span>
              <span style={{ display: 'block' }}>
                {moment(token.endTime).format('DD-MM-YYYY HH:MM')}
              </span>
            </td>
            <td className={styles.center}>{this.renderParticipateButton(token)}</td>
          </tr>
          {this.renderCollapse(token.ownerAddress)}
        </Fragment>
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
      tokenName } = this.state;

    if (loading) {
      return (
        <div className={styles.container} >
          <Spin size="large" />
        </div>
      );
    }
    return (
      <div className={styles.container}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Issuer</th>
              <th className={styles.right}>Total Supply</th>
              <th>Start / End Time</th>
              <th />
            </tr>
          </thead>
          <tbody>{this.renderToken()}</tbody>
        </table>
        <h3 className={styles.error}>{participateError}</h3>
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
      </div>
    );
  }
}

export default connect()(View);
