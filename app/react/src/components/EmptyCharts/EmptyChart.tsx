import * as React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

import McsIcons from '../McsIcons';

interface EmptyChartsProps {
  title: string;
  icon?: string;
}

const EmptyCharts: React.SFC<EmptyChartsProps> = ({ title, icon }) => {

  return (
    <Row className="mcs-card-no-data">
      <Col span={24} className="">
        <McsIcons type={icon} />
      </Col>
      <Col span={24} className="">
        {title}
      </Col>
    </Row>
  );
}

EmptyCharts.defaultProps = {
  icon: 'warning',
};

export default EmptyCharts;
