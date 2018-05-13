import React, { PureComponent, Fragment } from 'react';
import { Row, Col, Card, List } from 'antd';
import moment from 'moment';
import ActiveChart from 'components/ActiveChart';
import { ChartCard, Field } from 'components/Charts';

import { getTronPrice } from '../../services/api';

class Monitor extends PureComponent {
  state = {
    tronPriceData: [],
    lastDay: {},
  };

  async componentDidMount() {
    await this.loadData();
  }

  getLastDayFromTronPriceList = tronPriceList => {
    const lastTronPrice = tronPriceList[tronPriceList.length - 1];
    return {
      total: `${lastTronPrice.close}`,
      min: lastTronPrice.low,
      max: lastTronPrice.high,
    };
  };

  loadData = async () => {
    const { Data: tronPriceList = [] } = await getTronPrice();
    if (!tronPriceList.length) {
      return;
    }

    const tronPriceData = tronPriceList.map(price => ({
      x: `${moment.unix(price.time).format('YYYY-MM-DD HH:mm')}`,
      y: price.close,
    }));

    const lastDay = this.getLastDayFromTronPriceList(tronPriceList);

    this.setState({ tronPriceData, lastDay });
  };

  render() {
    return (
      <Fragment>
        <Row gutter={24}>
          <Col xl={18} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card title="TRON Price" style={{ marginBottom: 24 }} bordered={false}>
              <ActiveChart data={this.state.tronPriceData} lastDay={this.state.lastDay} />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24}>
            <Card title="TRXBalance" style={{ marginBottom: 30 }} bordered={false}>
              <ChartCard
                bordered={false}
                title="TRX Avaliable"
                total={199}
                footer={<Field label={moment(new Date()).format('DD-MM-YYYY HH:mm:ss')} />}
                contentHeight={46}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xl={18} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 24 }}>
            <Card title="TOKENS" style={{ marginBottom: 24 }} bordered={false}>
              <List.Item key="..........">
                <List.Item.Meta
                  title={<span href="https://getty.io">TRX</span>}
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

export default Monitor;
