import React, { PureComponent } from 'react';
import * as QRCode from 'qrcode';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Modal, Button, message } from 'antd';
import { Auth } from 'aws-amplify';
import CopyToClipboard from '../../components/CopyToClipboard/CopyToClipboard';
import styles from './Login.less';
import {
  confirmSignIn,
  setUserPk,
  confirmSignup,
  forgotPassword,
  confirmForgotPassword,
} from '../../services/api';
import { reloadAuthorized } from '../../utils/Authorized';
import { setAuthority } from '../../utils/authority';

class Login extends PureComponent {
  state = {
    username: '',
    password: '',
    user: {},
    code: '',
    totpCode: null,
    qrcode: null,
    modalVisible: false,
    pk: '',
    loginError: '',
    confirmLoginError: '',
    signInsuccess: false,
    forgotPasswordVisible: false,
    forgotPasswordEmail: '',
    forgotPasswordCode: '',
    newPassword: '',
    newPasswordVisible: false,
    confirmEmailVisible: false,
    confirmEmailError: '',
    loading: false,
  };


  onCancel = () => {
    this.setState({
      user: {},
      username: '',
      code: '',
      totpCode: null,
      qrcode: null,
      modalVisible: false,
      signInsuccess: false,
      loginError: '',
      confirmLoginError: '',
      forgotPasswordVisible: false,
      forgotPasswordEmail: '',
      forgotPasswordCode: '',
      newPassword: '',
      newPasswordVisible: false,
      loading: false,
    });
  };

  submit = async () => {
    const { dispatch } = this.props;
    const { username, password } = this.state;
    this.setState({ loading: true });
    try {
      await Auth.signIn(username, password);
      this.setState({ signInsuccess: true });
      setAuthority('user');
      reloadAuthorized();
      dispatch(routerRedux.push('/'));
      // const { user, totpCode } = await signIn(username, password);
      // if (totpCode) this.renderQRCode(totpCode, username);
      // this.setState({ totpCode, user, modalVisible: true, loading: false });
    } catch (error) {
      if (error.code === 'UserNotConfirmedException') {
        this.setState({ loading: false, confirmEmailVisible: true });
        return;
      }
      this.setState({ loginError: error.message, loading: false });
    }
  };

  isFormValid = () => {
    const { pk } = this.state;
    if (pk.length !== 64) return false;
  };
  change = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
      loginError: '',
      confirmLoginError: '',
      confirmEmailError: '',
    });
  };

  confirmSignIn = async () => {
    const { totpCode, user, code, pk } = this.state;
    const { dispatch } = this.props;

    try {
      await confirmSignIn(user, totpCode, code);
      // Confirmed sign successfully
      if (totpCode) await setUserPk(pk);
      this.setState({ signInsuccess: true, modalVisible: false });
      setAuthority('user');
      reloadAuthorized();
      dispatch(routerRedux.push('/'));
    } catch (error) {
      if (error.code === 'NotAuthorizedException') {
        this.setState({ confirmLoginError: error.message }, () => {
          message.warn('Session expired, try again');
          this.onCancel();
        });
        return;
      }
      this.setState({ confirmLoginError: error.message });
    }
  };

  sendEmailForgotPassword = async () => {
    const { forgotPasswordEmail } = this.state;
    try {
      await forgotPassword(forgotPasswordEmail);
      this.setState({ forgotPasswordVisible: false, newPasswordVisible: true });
    } catch (error) {
      // TODO: FAZER CASO DE FALHA
      this.setState({ forgotPasswordError: error.message });
    }
  };

  confirmForgotPassword = async () => {
    const { forgotPasswordEmail, forgotPasswordCode, newPassword } = this.state;
    await confirmForgotPassword(forgotPasswordEmail, forgotPasswordCode, newPassword);
    this.onCancel();
  };

  confirmEmail = async () => {
    const { username, code } = this.state;
    try {
      await confirmSignup({ username, code });
      this.setState({ confirmEmailVisible: false });
      message.success('Account confirmed with success !');
      this.submit();
    } catch (error) {
      this.setState({ confirmEmailError: error.message });
    }
  }

  renderQRCode = async (code, username) => {
    const totpUrl = `otpauth://totp/${username}?secret=${code}&issuer=TronWallet`;
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


  renderConfirmEmailModal = () => {
    const { confirmEmailVisible, confirmEmailError } = this.state;
    return (
      <Modal
        title="Confirm Signup"
        visible={confirmEmailVisible}
        onOk={this.confirmEmail}
        onCancel={() => this.setState({ modalVisible: false })}
      >
        <h3>We have sent you an email with the account verification code.Please type it to confirm your registration.</h3>
        <br />
        <h3>Verification Code:</h3>
        <input
          className={styles.formControl}
          onChange={this.change}
          type="text"
          name="code"
          id="code"
        />
        <h3 className={styles.error}>{confirmEmailError}</h3>
      </Modal>
    );
  };

  renderConfirmModal = () => {
    const { modalVisible, confirmLoginError, totpCode, qrcode } = this.state;
    let body;
    if (totpCode) {
      body = (
        <div>
          <p>
            Please, link your account with some TOTP authenticator using this QRCode (We recommend
            Google Authenticator). You wont be able to log into your account without a six digit
            code from some authenticator.
          </p>
          <div style={{ textAlign: 'center' }}>
            <img src={qrcode} alt="QRCode Authenticator" width={200} />
          </div>
          <br />
          <h3>Save this code for future references.</h3>
          <CopyToClipboard text={totpCode} />
          <br />
          <h3>Authenticator Code</h3>
          <input
            className={styles.formControl}
            onChange={this.change}
            type="text"
            name="code"
            id="code"
            placeholder="Insert code provided by the authenticator"
          />
        </div>
      );
    } else {
      body = (
        <div>
          <h3>Please, type the code provided by your authenticator to login</h3>
          <input
            className={styles.formControl}
            onChange={this.change}
            type="text"
            name="code"
            id="code"
          />
        </div>
      );
    }
    return (
      <Modal
        title={totpCode ? 'First Sign In' : 'Confirm Sign In'}
        visible={modalVisible}
        onOk={this.confirmSignIn}
        onCancel={this.onCancel}
        okText={totpCode ? 'Confirm Configuration' : 'Sign In'}
      >
        <div className={styles.modalBody}>{body}</div>
        <h3 className={styles.error}>{confirmLoginError}</h3>
      </Modal>
    );
  };

  renderForgotPasswordModal = () => {
    const { forgotPasswordVisible, forgotPasswordEmail, forgotPasswordError } = this.state;
    return (
      <Modal
        title="Forgot password"
        visible={forgotPasswordVisible}
        onOk={this.sendEmailForgotPassword}
        onCancel={this.onCancel}
      >
        <h3>Email</h3>
        <input
          className={styles.formControl}
          value={forgotPasswordEmail}
          onChange={this.change}
          type="email"
          name="forgotPasswordEmail"
          id="forgotPasswordEmail"
        />
        <h3 className={styles.error}>{forgotPasswordError}</h3>
      </Modal>
    );
  };

  renderConfirmForgotPasswordModal = () => {
    const { newPasswordVisible, newPassword, forgotPasswordEmail, forgotPasswordCode } = this.state;
    return (
      <Modal
        title="Forgot password"
        visible={newPasswordVisible}
        onOk={this.confirmForgotPassword}
        onCancel={this.onCancel}
      >
        <h3>Email</h3>
        <input
          className={styles.formControl}
          onChange={this.change}
          value={forgotPasswordEmail}
          type="email"
          name="forgotPasswordEmail"
          id="forgotPasswordEmail"
        />
        <h3>Code</h3>
        <input
          className={styles.formControl}
          onChange={this.change}
          value={forgotPasswordCode}
          type="text"
          name="forgotPasswordCode"
          id="forgotPasswordCode"
        />
        <h3>New password</h3>
        <input
          className={styles.formControl}
          value={newPassword}
          onChange={this.change}
          type="password"
          name="newPassword"
          id="newPassword"
        />
      </Modal>
    );
  };

  render() {
    const { username, password, loginError, loading } = this.state;
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardHeaderTitle}>Login</h2>
        </div>
        <div className={styles.formContent}>
          <div className={styles.form}>
            {this.renderSuccessMessage()}
            <h3>Username</h3>
            <input
              className={styles.formControl}
              value={username}
              onChange={this.change}
              type="username"
              name="username"
              id="username"
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
            <Button
              type="primary"
              onClick={this.submit}
              className={styles.button}
              loading={loading}
            >
              Login
            </Button>
            <div className={styles.linksContainer}>
              <h3
                onClick={() => this.props.dispatch(routerRedux.push('/user/signup'))}
                className={styles.createAccount}
              >
                Create account
              </h3>
              <h3
                onClick={() => this.setState({ forgotPasswordVisible: true })}
                className={styles.createAccount}
              >
                Forgot password?
              </h3>
            </div>
          </div>
          {this.renderConfirmModal()}
          {this.renderConfirmEmailModal()}
          {this.renderForgotPasswordModal()}
          {this.renderConfirmForgotPasswordModal()}
        </div>
      </div>
    );
  }
}

export default connect()(Login);
