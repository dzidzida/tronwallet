import React, { Component } from 'react';
import { Modal } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import styles from './TransactionResultModal.less';

class TransactionQRCode extends Component {
  onCloseModal = () => {
    const { onClose } = this.props;
    const { result } = this.props.transaction;
    if (result) {
      this.props.dispatch({
        type: 'user/fetchWalletData',
      });
    }
    onClose(); // Closes the tx modal
  };

  renderContracts = () => {
    const { contracts } = this.props.transaction;
    if (!contracts) return;
    const contractsElements = [];
    for (const ctr in contracts[0]) {
      if (ctr === 'amount') {
        contractsElements.push(
          <h3 key={ctr}>
            {ctr} : {contracts[0][ctr] / 1000000}
          </h3>
        );
      } else {
        contractsElements.push(
          <h3 key={ctr}>
            {ctr} : {contracts[0][ctr]}
          </h3>
        );
      }
    }
    return contractsElements;
  };

  render() {
    const { visible } = this.props;
    const { result, timestamp } = this.props.transaction;
    const footerButton = (
      <button className={styles.button} onClick={this.onCloseModal}>
        {'Ok'}
      </button>
    );
    return (
      <Modal
        visible={visible}
        title="Last transaction"
        onCancel={this.onCloseModal}
        footer={footerButton}
      >
        <div>
          {visible && (
            <h2> Your last transaction was
              {result ? (<strong className={styles.success}> successful</strong>)
                : (<strong className={styles.fail}> not successful</strong>)}
            </h2>)}
          <p>{moment(timestamp / 1000000).format('MM/DD/YYYY HH:MM:SS')}</p>
        </div>
        <div>{this.renderContracts()}</div>
      </Modal >
    );
  }
}

export default connect(({ monitor }) => ({
  transaction: monitor.transaction,
}))(TransactionQRCode);
