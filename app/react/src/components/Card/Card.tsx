import * as React from 'react';
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
      { (title || buttons)
        && <Row className="mcs-card-header">
          <Col span={24}>
            <span className="mcs-card-title">{title}</span>
            <span className="mcs-card-button">{buttons}</span>
          </Col>
          <Col span={24}><hr /></Col>
        </Row>
      }
      <Row>
        { isLoading ? (
          <Col span={24} className="text-center">
            <Spin />
          </Col>
        ) : children}
      </Row>
    </Row>
  );
};

Card.defaultProps = {
  buttons: undefined,
  title: undefined,
  isLoading: false,
};

export default Card;
