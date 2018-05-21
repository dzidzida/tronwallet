import React, { Component } from 'react';
import { connect } from 'dva';
import * as QRCode from 'qrcode';
import { Form, Input, Button, Progress } from 'antd';
import styles from './ConfirmLogin.less';

const FormItem = Form.Item;

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

@connect(({ register, login, loading }) => ({
  register,
  login,
  submitting: loading.effects['register/submit'],
}))
@Form.create()
export default class ConfirmLogin extends Component {
  state = {
    qrcode: null,
  };

  // componentWillReceiveProps(nextProps) {
  //   const account = this.props.form.getFieldValue('mail');
  //   if (nextProps.login.status === 'ok') {
  //     this.props.dispatch(
  //       routerRedux.push({
  //         pathname: '/user/register-result',
  //         state: {
  //           account,
  //         },
  //       })
  //     );
  //   }
  // }
  componentDidMount() {
    this.renderTOTPcode();
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { code } = this.state;
    const { user } = this.props.login;
    this.props.dispatch({
      type: 'login/confirmlogin',
      payload: {
        code,
        user,
      },
    });
  };

  renderTOTPcode = async () => {
    const { user, totpCode } = this.props.login;
    const toQrcode = `otpauth://totp/AWSCognito:${
      user.username
    }?secret=${totpCode}&issuer=AWSCognito`;
    // const str = `otpauth://totp/AWSCognito:${user.username}?secret=${totpCode}&issuer=AWSCognito`;
    const qrcode = await QRCode.toDataURL(toQrcode);
    this.setState({ qrcode });
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  render() {
    const { submitting } = this.props;
    // const { login } = this.props;
    return (
      <div className={styles.main}>
        <h3>Confirm Sign-In</h3>
        <Form onSubmit={this.handleSubmit}>
          <FormItem>
            <Input
              size="large"
              onChange={e => this.setState({ code: e.target.value })}
              value={this.state.code}
              placeholder="Confirmation code"
            />
          </FormItem>
          <FormItem>
            <Button
              size="large"
              loading={submitting}
              className={styles.submit}
              type="primary"
              htmlType="submit"
              onClick={this.handleSubmit}
            >
              Type the confirmation code
            </Button>
          </FormItem>
        </Form>
        <img src={this.state.qrcode} alt="qrcode" />
      </div>
    );
  }
}
