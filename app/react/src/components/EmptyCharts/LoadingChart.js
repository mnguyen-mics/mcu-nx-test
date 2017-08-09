import React from 'react';
import { Row, Col, Spin } from 'antd';

function LoadingChart() {

  return (
    <Row className="mcs-card-no-data">
      <Col span={24} className="">
        <Spin size="large" />
      </Col>
    </Row>
  );
}

export default LoadingChart;
