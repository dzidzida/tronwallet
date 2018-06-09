import React, { Fragment, PureComponent } from 'react';
import QrReader from 'react-qr-reader';
import { Modal, Alert } from 'antd';
import styles from './PublicKeyModal.less';
import { isAddressValid } from '../../utils/wallet-api-v2/utils/address';

class PublicKeyModal extends PureComponent {
  state = {
    error: '',
  }

  handleScanTransaction = (data) => {
    const { onScan, onClose } = this.props;
    if (data) {
      if (isAddressValid(data)) {
        onClose();
        onScan(data);
      } else {
        this.setState({ error: 'Invalid Transaction' });
      }
    }
  }

  render() {
    const { visible, title, onClose } = this.props;
    const { error } = this.state;
    return (
      <Modal
        visible={visible}
        title={title}
        onCancel={onClose}
        onOk={onClose}
        footer={null}
      >
        <div className={styles.transaction}>
          <Fragment>
            <p className={styles.messageFail}>{error}</p>
            <Alert
              message="Notice"
              description="Please, show your receive qrcode to the camera."
              type="info"
              showIcon
            />
            <br />
            <QrReader
              delay={300}
              onError={() => this.setState({ error: 'Error while reading QRCode' })}
              onScan={this.handleScanTransaction}
              style={{ width: '110%', alignSelf: 'center' }}
            />
          </Fragment>
        </div>
      </Modal>
    );
  }
}

export default PublicKeyModal;
