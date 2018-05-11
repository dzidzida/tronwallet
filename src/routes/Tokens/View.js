import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import styles from './View.less';
import Client from '../../utils/wallet-service/client';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';

class View extends PureComponent {
  state = {
    modalVisible: false,
    currentToken: null,
    amount: 0,
    tokenList: [],
    acceptTerms: false,
    participateError: null,
    transaction: {
      data: null,
    },
  };

  componentDidMount() {
    this.loadTokens();
  }

  onChange = e => {
    const { name, value, type, checked } = e.target;
    this.setState({
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  onClick = token => {
    this.setState({
      currentToken: token,
      amount: 0,
      acceptTerms: false,
    });
  };

  onCloseModal = () => {
    this.setState({ modalVisible: false });
  };

  submit = async e => {
    e.preventDefault();
    const { currentToken, amount, transaction } = this.state;
    try {
      const TransactionData = await Client.participateToken({ ...currentToken, amount });
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
      this.setState({ participateError: 'Something wrong participating for Token' });
    }
  };

  loadTokens = async () => {
    const tokenList = await Client.getTokensList();
    this.setState({ tokenList });
  };

  selectToken = tokenId => {
    this.setState({ currentToken: tokenId });
  };

  renderParticipateButton = token => {
    if (moment(token.startTime).isAfter() || moment(token.endTime).isBefore()) {
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

  renderCollapse = ownerAddress => {
    const { currentToken, amount, acceptTerms } = this.state;
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
              <h3 className={styles.item}>{currentToken.price} TRX</h3>
            </div>
            <div className={styles.collapseRow}>
              <h3 className={styles.item}>
                <b>Amount</b>
              </h3>
              <input
                className={styles.amount}
                name="amount"
                type="number"
                value={amount}
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
                I&#39;ve confirmed to spend <b>{currentToken.price * amount} TRX</b> on token
                distribution, and get a total of <b>{amount} Beetle Juice</b> tokens.
              </span>
            </div>
            <div className={styles.collapseRow}>
              <button
                className={acceptTerms && amount > 0 ? styles.transaction : styles.disabled}
                onClick={this.submit}
                disabled={!acceptTerms}
              >
                Confirm transaction
              </button>
            </div>
          </td>
        </tr>
      );
    }
    return null;
  };

  renderToken = () => {
    return this.state.tokenList.map(token => {
      return (
        <Fragment key={token.name}>
          <tr>
            <td>{token.name}</td>
            <td>{token.ownerAddress}</td>
            <td className={styles.right}>{token.totalSupply}</td>
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
    const { transaction, modalVisible, participateError } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.buttonContainer}>
          <a
            onClick={() => this.props.dispatch(routerRedux.push('/create'))}
            className={styles.create}
          >
            Create
          </a>
        </div>
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
          message="You participated to the asset"
          data={transaction.data}
          visible={modalVisible}
          onClose={this.onCloseModal}
        />
      </div>
    );
  }
}

export default connect()(View);
