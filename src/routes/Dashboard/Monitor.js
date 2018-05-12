import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, List } from 'antd';
import ActiveChart from 'components/ActiveChart';
import Authorized from '../../utils/Authorized';

const { Secured } = Authorized;

// use permission as a parameter
const havePermissionAsync = new Promise(resolve => {
  // Call resolve on behalf of passed
  setTimeout(() => resolve(), 1000);
});
@Secured(havePermissionAsync)
@connect(({ monitor, loading }) => ({
  monitor,
  loading: loading.models.monitor,
}))
export default class Monitor extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'monitor/fetchTags',
    });
  }

  render() {
    return (
      <Fragment>
        <Row gutter={24}>
          <Col xl={18} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card title="TRON Price" style={{ marginBottom: 24 }} bordered={false}>
              <ActiveChart />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24}>
            <Card title="TRX Balance" style={{ marginBottom: 24 }} bordered={false}>
              <p>1999.0000</p>
            </Card>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xl={18} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card title="TOKENS" style={{ marginBottom: 24 }} bordered={false}>
              <List.Item key="..........">
                <List.Item.Meta
                  title={<a href="https://ant.design">TRX</a>}
                  description="dio@getty.io"
                />
                <div>Content</div>
              </List.Item>
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24}>
            <Card title="Frozen Tokens" style={{ marginBottom: 24 }} bordered={false}>
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </Col>
        </Row>
      </Fragment>
    );
  }
}
