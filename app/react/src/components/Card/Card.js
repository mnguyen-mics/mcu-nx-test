import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Spin } from 'antd';

function Card(props) {
  const { title, buttons, isLoading, children } = props;

  return (
    <Row className="mcs-card-container">
      { (title || buttons)
        && <Row className="mcs-card-header">
          <Col span={24}>
            <span className="mcs-card-title">{title}</span>
            <span className="mcs-card-button">{buttons}</span>
          </Col>
          <hr />
        </Row>
      }
      <Row>
        {(isLoading) ? (
          <Col span={24} className="text-center">
            <Spin />
          </Col>
        ) : children}
      </Row>
    </Row>
  );
}

Card.defaultProps = {
  buttons: null,
  title: null,
  isLoading: false,
};

Card.propTypes = {
  title: PropTypes.string,
  buttons: PropTypes.element,
  isLoading: PropTypes.bool,
};

export default Card;
