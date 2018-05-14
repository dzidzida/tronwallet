import React from 'react';
import { Row, Col } from 'antd';
import styles from './index.less';

const Header = ({ inVoting }) => (
  <div className={styles.header}>
    <Row>
      <Col xs={2}>#</Col>
      <Col xs={inVoting ? 16 : 20}>
        <span className={styles.textLeft}>URL</span>
      </Col>
      <Col xs={inVoting ? 3 : 2}>Votes</Col>
      {inVoting && (<Col xs={3}>Your vote</Col>)}
    </Row>
  </div>
);

export default Header;