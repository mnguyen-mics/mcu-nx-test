import * as React from 'react';
import { Row, Col, Spin } from 'antd';

interface LoadingChartProps {
  className?: string;
}

const LoadingChart: React.SFC<LoadingChartProps> = ({ className }) => {
  return (
    <Row className={`mcs-card-no-data ${className ? className : ''}`}>
      <Col span={24}>
        <Spin size="large" />
      </Col>
    </Row>
  );
};

export default LoadingChart;
