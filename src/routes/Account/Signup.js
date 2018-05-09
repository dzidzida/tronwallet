import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import styles from './Signup.less';
import { signUp, confirmSignup } from '../../services/api';

class Signup extends PureComponent {
  state = {
    password: '',
    email: '',
    phoneNumber: '',
    modalVisible: false,
  };

  submit = async () => {
    console.log('SUBMIT: ', this.state);
    try {
      const response = await signUp(this.state);
      console.log('RESPONSE SIGNUP:::: ', response);
      this.setState({ email: response.user.username, modalVisible: true });
    } catch (error) {
      console.log('ERROR SIGNUP:::: ', error);
      // TODO: FAZER CENÁRIO DE FALHA DE SIGNUP
    }
  };

  confirmSignup = async () => {
    console.log('COMFIRM');
    try {
      const response = await confirmSignup(this.state);
      console.log('RESPONSE CONFIRM:::: ', response);
      // TODO: FAZER CENÁRIO DE SUCESSO
    } catch (error) {
      console.log('ERROR CONFIRM:::: ', error);
      // TODO: FAZER CENÁRIO DE FALHA DE CONFIMAÇÃO
    }
    this.setState({ modalVisible: false });
  };

  change = e => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  renderConfirmModal = () => {
    const { modalVisible, email } = this.state;
    return (
      <Modal
        title="Confirm signup"
        visible={modalVisible}
        onOk={this.confirmSignup}
        onCancel={() => this.setState({ modalVisible: false })}
      >
        <h3>Email</h3>
        <input
          className={styles.formControl}
          value={email}
          onChange={this.change}
          type="email"
          name="email"
          id="email"
        />
        <h3>Code</h3>
        <input
          className={styles.formControl}
          onChange={this.change}
          type="text"
          name="code"
          id="code"
        />
      </Modal>
    );
  };

  render() {
    const { password, email, phoneNumber } = this.state;
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardHeaderTitle}>Register</h2>
        </div>
        <div className={styles.formContent}>
          <div className={styles.form}>
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
            <h3>Password</h3>
            <input
              className={styles.formControl}
              value={password}
              onChange={this.change}
              type="password"
              name="password"
              id="password"
            />
            <button className={styles.button} onClick={this.submit}>
              Register
            </button>
          </div>
        </div>
        {this.renderConfirmModal()}
      </div>
    );
  }
}

export default Signup;
