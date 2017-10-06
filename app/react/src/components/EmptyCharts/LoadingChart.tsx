import * as React from 'react';
import { Row, Col, Spin } from 'antd';

const LoadingChart: React.SFC = () => {
  return (
    <Row className="mcs-card-no-data">
      <Col span={24} className="">
        <Spin size="large" />
      </Col>
    </Row>
  );
};

export default LoadingChart;
