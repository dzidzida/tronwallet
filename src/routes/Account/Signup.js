import React, { PureComponent } from 'react';
import styles from './Signup.less';

class Signup extends PureComponent {
  state = {
    userName: '',
    password: '',
    email: '',
    phoneNumber: '',
  };

  submit = () => {
    console.log('SUBMIT: ', this.state);
  };

  change = e => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  render() {
    const { userName, password, email, phoneNumber } = this.state;
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardHeaderTitle}>Register</h2>
        </div>
        <div className={styles.formContent}>
          <div className={styles.form}>
            <h3>Username</h3>
            <input
              className={styles.formControl}
              value={userName}
              onChange={this.change}
              type="text"
              name="userName"
              id="userName"
            />
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
      </div>
    );
  }
}

export default Signup;
