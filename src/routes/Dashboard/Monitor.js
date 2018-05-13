import { Card, Col, List, Row, Button } from 'antd';
import ActiveChart from 'components/ActiveChart';
import { ChartCard, Field } from 'components/Charts';
import moment from 'moment';
import React, { Fragment, PureComponent } from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
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
          <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card
              title="TRON Price"
              style={{ marginBottom: 24 }}
              bordered={false}
              extra={
                <Fragment>
                  <Button type="primary" size="default" icon="copy" shape="circle" ghost />
                </Fragment>
							}
            >
              <ActiveChart data={this.state.tronPriceData} lastDay={this.state.lastDay} />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card
              title="TRX BALANCE"
              style={{ marginBottom: 30 }}
              bordered={false}
              extra={
                <Fragment>
                  <Button type="primary" size="default" icon="copy" shape="circle" ghost />
                </Fragment>
							}
            >
              <ChartCard
                bordered={false}
                title="TRX Avaliable"
                total={199}
                footer={<Field label={moment(new Date()).format('DD-MM-YYYY HH:mm:ss')} />}
                contentHeight={46}
              />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card
              title="FROZEN TOKENS"
              style={{ marginBottom: 30 }}
              bordered={false} 
              extra={
                <Fragment>
                  <Button type="danger" size="default" ghost icon="close" shape="circle" />
                  {'  '}
                  <Button type="primary" size="default" icon="check" shape="circle" ghost />
                </Fragment>
							}
            >
              <ChartCard
                bordered={false}
                title="Amount"
                total={199}
                contentHeight={46}
                footer={<Field label="Expires" value={moment(new Date()).format('DD-MM-YYYY HH:mm:ss')} />}
              />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card
              title="MY TRON ACCOUNT"
              style={{ marginBottom: 30 }}
              bordered={false}
              extra={
                <Fragment>
                  <Button type="danger" size="default" ghost icon="edit" shape="circle" />
                  {'    '}
                  <Button type="primary" size="default" icon="copy" shape="circle" ghost />
                </Fragment>
							}
            >
              <ChartCard
                bordered={false}
                title="Address"
                total="27UzaKnuqqHmfyzUChETgU1EoBqHy8rRoGk"
                footer={<Field label="27UzaKnuqqHmfyzUChETgU1EoBqHy8rRoGk" />}
                contentHeight={46}
              />
            </Card>
          </Col>				
        </Row>
        <Row gutter={24}>
          <Col xl={9} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
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
          <Col xl={9} lg={24} md={24} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Card title="TRANSACTIONS" style={{ marginBottom: 24 }} bordered={false}>
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
            <Card title="OFFICIAL NEWS" style={{ marginBottom: 16 }} bordered={false}>
              <TwitterTimelineEmbed
                sourceType="profile"
                screenName="justinsuntron"
                options={{height: 600}}
              />
            </Card>						
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default Monitor;
