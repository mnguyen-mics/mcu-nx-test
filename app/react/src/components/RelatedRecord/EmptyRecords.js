import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import McsIcons from '../McsIcons';

function EmptyRecords({ iconType, message, className }) {
  return (
    <Row className={`empty-related-records ${className}`}>
      <Col span={24}>
        <McsIcons type={iconType} />
      </Col>
      <Col span={24}>
        {message}
      </Col>
    </Row>
  );
}

EmptyRecords.defaultProps = {
  iconType: 'warning',
  className: '',
};

EmptyRecords.propTypes = {
  iconType: PropTypes.string,
  message: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default EmptyRecords;
