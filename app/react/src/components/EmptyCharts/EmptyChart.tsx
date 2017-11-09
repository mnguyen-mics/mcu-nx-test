import * as React from 'react';
import { Row, Col } from 'antd';

import McsIcons, { McsIconType } from '../McsIcons';

interface EmptyChartsProps {
  title: string;
  icon?: McsIconType;
}

const EmptyCharts: React.SFC<EmptyChartsProps> = ({ title, icon }) => {
  return (
    <Row className="mcs-card-no-data">
      <Col span={24} className="">
        <McsIcons type={icon!} />
      </Col>
      <Col span={24} className="">
        {title}
      </Col>
    </Row>
  );
};

EmptyCharts.defaultProps = {
  icon: 'warning',
};

export default EmptyCharts;
