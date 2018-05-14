import React from 'react';
import { Row, Col, List } from 'antd';
import styles from './index.less';
import ItemIndex from './ItemIndex';

const ListContent = ({ index, url, address }) => (
  <div className={styles.actionContainer}>
    <Row>
      <Col xs={4}>
        <ItemIndex index={index} />
      </Col>
      <Col sm={8} xs={24}>
        <List.Item.Meta title={<a href="#">{url}</a>} description={address} />
      </Col>
    </Row>
  </div>
);

export default ListContent;
