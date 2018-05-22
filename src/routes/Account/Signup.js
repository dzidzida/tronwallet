import React, { PureComponent } from 'react';
import { Modal, Button, Tooltip, Icon, message } from 'antd';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import styles from './Signup.less';
import { signUp, confirmSignup } from '../../services/api';
import { reloadAuthorized } from '../../utils/Authorized';
import { setAuthority } from '../../utils/authority';

class Signup extends PureComponent {
  state = {
    password: '',
    email: '',
    phoneNumber: '',
    modalVisible: false,
    signupError: '',
    confirmSignupError: '',
    signupSuccess: false,
    loading: false,
  };

  submit = async () => {
    this.setState({ loading: true });
    try {
      const response = await signUp(this.state);
      this.setState({
        email: response.user.username,
        modalVisible: true,
        signupError: '',
        signupSuccess: false,
        loading: false,
      });
    } catch (error) {
      this.setState({ signupError: error.message, signupSuccess: false, loading: false });
    }
  };

  confirmSignup = async () => {
    try {
      await confirmSignup(this.state);
      this.setState({
        modalVisible: false,
        signupSuccess: true,
        password: '',
        email: '',
        phoneNumber: '',
      });
      setAuthority('user');
      reloadAuthorized();
      this.props.dispatch(routerRedux.push('/user/login'));
      message.success('Account confirmed with success! Log in to enter.');
    } catch (error) {
      this.setState({ confirmSignupError: error.message, signupSuccess: false });
    }
  };

  change = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  renderSuccessMessage = () => {
    const { signupSuccess } = this.state;
    if (signupSuccess) {
      return (
        <div className={styles.messageContent}>
          <h2 className={styles.messageSuccess}>Registred successfully!</h2>
        </div>
      );
    }

    return null;
  };

  renderConfirmModal = () => {
    const { modalVisible, email, confirmSignupError } = this.state;
    return (
      <Modal
        title="Confirm Signup"
        visible={modalVisible}
        onOk={this.confirmSignup}
        onCancel={() => this.setState({ modalVisible: false })}
      >
        <h3>We have sent you an email with the account verification code. Please type it to confirm your registration.</h3>
        <br/>
        <h3>Verification Code:</h3>
        <input
          className={styles.formControl}
          onChange={this.change}
          type="text"
          name="code"
          id="code"
        />
        <h3 className={styles.error}>{confirmSignupError}</h3>
      </Modal>
    );
  };

  render() {
    const { password, email, phoneNumber, signupError, loading } = this.state;
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardHeaderTitle}>Register</h2>
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
            <h3>Phone number</h3>
            <input
              className={styles.formControl}
              value={phoneNumber}
              onChange={this.change}
              type="text"
              name="phoneNumber"
              id="phoneNumber"
            />
            <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <h3 style={{ paddingRight: 5 }}>Password</h3>
              <Tooltip
                placement="right"
                title="Password must have at least one uppercase letter and one special character"
              >
                <Icon style={{ color: 'rgba(0,0,0,.25)' }} type="info-circle-o" />
              </Tooltip>
            </div>
            <input
              className={styles.formControl}
              value={password}
              onChange={this.change}
              type="password"
              name="password"
              id="password"
            />
            <h3 className={styles.error}>{signupError}</h3>
            <Button
              type="primary"
              onClick={this.submit}
              className={styles.button}
              loading={loading}
            >
              Register
            </Button>
            {/* <button className={styles.button} onClick={this.submit}>
              Register
            </button> */}
            <h3
              onClick={() => this.props.dispatch(routerRedux.push('/user/login'))}
              className={styles.backLogin}
            >
              Back
            </h3>
          </div>
        </div>
        {this.renderConfirmModal()}
      </div>
    );
  }
}

export default connect()(Signup);
