import React, { PureComponent } from 'react';
import styles from './Login.less';

class Login extends PureComponent {
  state = {
    userName: '',
    password: '',
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
    const { userName, password } = this.state;
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardHeaderTitle}>Login</h2>
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
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
