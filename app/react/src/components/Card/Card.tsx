import * as React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Spin } from 'antd';

interface CardProps {
  buttons: JSX.Element;
  title?: string;
  isLoading?: boolean;
}

const Card: React.SFC<CardProps> = (props) => {
  const { title, buttons, isLoading, children } = props;
  return (
    <Row className="mcs-card-container">
      { (props.title || props.buttons)
        && <Row className="mcs-card-header">
          <Col span={24}>
            <span className="mcs-card-title">{props.title}</span>
            <span className="mcs-card-button">{props.buttons}</span>
          </Col>
          <hr />
        </Row>
      }
      <Row>
        {(props.isLoading) ? (
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

export default Card;
