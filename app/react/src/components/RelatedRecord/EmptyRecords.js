import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Icon } from 'antd';

function EmptyRecords({ iconType, message, className }) {
  return (
    <Row className={`empty-related-records ${className}`}>
      <Col span={24}>
        <Icon type={iconType} />
      </Col>
      <Col span={24}>
        {message}
      </Col>
    </Row>
  );
}

EmptyRecords.defaultProps = {
  iconType: 'exclamation-circle-o',
  className: '',
};

EmptyRecords.propTypes = {
  iconType: PropTypes.string,
  message: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default EmptyRecords;
