import React, { Fragment } from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon } from 'antd';
import GlobalFooter from '../components/GlobalFooter';
import styles from './UserLayout.less';
import tronLogo from '../../public/tron-logo.png';
import { getRoutes } from '../utils/utils';
import { version } from './../../package.json';

const copyright = (
  <Fragment>
    <p>{`v${version}`}</p>
    Copyright <Icon type="copyright" /> 2018{' '}
    <a src="https://getty.io" target="_blank">
      Getty/IO Inc.
    </a>
  </Fragment>
);

class UserLayout extends React.PureComponent {
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'TronWallet';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - TronWallet`;
    }
    return title;
  }
  render() {
    const { routerData, match } = this.props;
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src={tronLogo} />
                  <span className={styles.title}>TronWallet</span>
                </Link>
              </div>
              <div className={styles.desc}>by Getty.io</div>
            </div>
            <Switch>
              {getRoutes(match.path, routerData).map(item => (
                <Route
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                />
              ))}
              <Redirect exact from="/user" to="/user/login" />
              <Redirect to="/user/login" />
            </Switch>
          </div>
          <GlobalFooter copyright={copyright} />
        </div>
      </DocumentTitle>
    );
  }
}

export default UserLayout;
