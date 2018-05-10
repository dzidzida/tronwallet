import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import styles from './View.less';
import tokens from '../../utils/wallet-service/tokens.json';

class View extends PureComponent {
  state = {
    currentToken: null,
    amount: 0,
    acceptTerms: false,
  };

  onChange = e => {
    const { name, value, type, checked } = e.target;
    this.setState({
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  onClick = tokenId => {
    this.setState({
      currentToken: tokenId,
      amount: 0,
      acceptTerms: false,
    });
  };

  selectToken = tokenId => {
    this.setState({ currentToken: tokenId });
  };

  renderParticipateButton = token => {
    const { currentToken } = this.state;
    if (currentToken && currentToken.id === token.id) {
      return (
        <button className={styles.close} onClick={() => this.onClick(null)}>
          Close
        </button>
      );
    }
    return (
      <button className={styles.participate} onClick={() => this.onClick(token)}>
        Participate
      </button>
    );
  };

  renderCollapse = id => {
    const { currentToken, amount, acceptTerms } = this.state;
    if (currentToken && currentToken.id === id) {
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
    return tokens.map(token => {
      return (
        <Fragment key={token.id}>
          <tr>
            <td>{token.name}</td>
            <td>{token.issuer}</td>
            <td className={styles.right}>{token.totalSupply}</td>
            <td>{token.time}</td>
            <td className={styles.center}>{this.renderParticipateButton(token)}</td>
          </tr>
          {this.renderCollapse(token.id)}
        </Fragment>
      );
    });
  };

  render() {
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
      </div>
    );
  }
}

export default connect()(View);
