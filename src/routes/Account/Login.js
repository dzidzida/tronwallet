import React, { PureComponent } from 'react';
import * as QRCode from 'qrcode';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Modal } from 'antd';
import CopyToClipboard from '../../components/CopyToClipboard/CopyToClipboard';
import styles from './Login.less';
import { signIn, confirmSignIn } from '../../services/api';
import { reloadAuthorized } from '../../utils/Authorized';
import { setAuthority } from '../../utils/authority';

class Login extends PureComponent {
  state = {
    email: '',
    password: '',
    user: {},
    code: '',
    totpCode: null,
    qrcode: null,
    modalVisible: false,
    loginError: '',
    confirmLoginError: '',
    signInsuccess: false,
  };

  onCancel = () => {
    this.setState({
      user: {},
      code: '',
      totpCode: null,
      qrcode: null,
      modalVisible: false,
      signInsuccess: false,
      loginError: '',
      confirmLoginError: '',
    });
  };

  submit = async () => {
    const { email, password } = this.state;
    try {
      const { user, totpCode } = await signIn(email, password);
      if (totpCode) this.renderQRCode(totpCode, email);
      this.setState({ totpCode, user });
    } catch (error) {
      this.setState({ loginError: error.message });
    } finally {
      this.setState({ modalVisible: true });
    }
  };

  change = e => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  confirmSignIn = async () => {
    const { totpCode, user, code } = this.state;
    const { dispatch } = this.props;
    try {
      await confirmSignIn(user, totpCode, code);
      this.setState({ signInsuccess: true, modalVisible: false });
      // Confirmed sign successfully
      setAuthority('user');
      reloadAuthorized();
      dispatch(routerRedux.push('/'));
    } catch (error) {
      this.setState({ confirmLoginError: error.message });
    }
  };

  renderQRCode = async (code, username) => {
    const totpUrl = `otpauth://totp/AWSCognito:${username}?secret=${code}&issuer=AWSCognito`;
    const qrcode = await QRCode.toDataURL(totpUrl);
    this.setState({ qrcode });
  };

  renderSuccessMessage = () => {
    const { signInsuccess } = this.state;
    if (signInsuccess) {
      return (
        <div className={styles.messageContent}>
          <h2 className={styles.messageSuccess}>Logged in successfully!</h2>
        </div>
      );
    }

    return null;
  };

  renderConfirmModal = () => {
    const { modalVisible, confirmLoginError, totpCode, qrcode } = this.state;
    let body;
    if (totpCode) {
      body = (
        <>
          <p>
            Please, link your account with some TOTP authenticator using this QRCode (We recommend
            Google Authenticator). You wont be able to log into your account without a six digit
            code from some authenticator.
          </p>
          <img src={qrcode} alt="QRCode Authenticator" width={200} />
          <h3>Save this secret link for future references</h3>
          <CopyToClipboard text={totpCode} />
          <h3>Authenticator Code</h3>
          <input
            className={styles.formControl}
            onChange={this.change}
            type="text"
            name="code"
            id="code"
            placeholder="Insert code provided by the authenticator"
          />
        </>
      );
    } else {
      body = (
        <>
          <h3>Please, type the code provided by your authenticator to login</h3>
          <input
            className={styles.formControl}
            onChange={this.change}
            type="text"
            name="code"
            id="code"
          />
        </>
      );
    }
    return (
      <Modal
        title="Confirm Sign In"
        visible={modalVisible}
        onOk={this.confirmSignIn}
        onCancel={this.onCancel}
      >
        <div className={styles.modalBody}>{body}</div>
        <h3 className={styles.error}>{confirmLoginError}</h3>
      </Modal>
    );
  };

  render() {
    const { email, password, loginError } = this.state;
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardHeaderTitle}>Login</h2>
        </div>
        <div className={styles.formContent}>
          <div className={styles.form}>
            {this.renderSuccessMessage()}
            <h3>Email</h3>
            <input
              className={styles.formControl}
              value={email}
              onChange={this.change}
              type="email"
              name="email"
              id="email"
            />
            <h3>Password</h3>
            <input
              className={styles.formControl}
              value={password}
              onChange={this.change}
              type="password"
              name="password"
              id="password"
            />
            <h3 className={styles.error}>{loginError}</h3>
            <button className={styles.button} onClick={this.submit}>
              Login
            </button>
            <h3
              onClick={() => this.props.dispatch(routerRedux.push('/user/signup'))}
              className={styles.createAccount}
            >
              Create account
            </h3>
          </div>
          {this.renderConfirmModal()}
        </div>
      </div>
    );
  }
}

export default connect()(Login);
