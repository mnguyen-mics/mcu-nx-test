import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

import McsIcons from '../McsIcons';

function EmptyCharts({ title, icon }) {

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

EmptyCharts.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
};

export default EmptyCharts;
