import * as React from 'react';
import { Row, Col, Spin } from 'antd';

export interface CardProps {
  buttons?: React.ReactNode;
  title?: React.ReactNode;
  isLoading?: boolean;
}

class Card extends React.Component<CardProps> {
  render() {
    const { title, buttons, isLoading, children } = this.props;

    const hasHeader = title || buttons;

    const titleElement = title && (
      <span className="mcs-card-title">{title}</span>
    );
    const buttonsElement = buttons && (
      <span className="mcs-card-button">{buttons}</span>
    );

    return (
      <Row className="mcs-card-container">
        {hasHeader && (
          <Row className="mcs-card-header">
            <Col span={24}>
              {titleElement}
              {buttonsElement}
            </Col>
            <Col span={24}>
              <hr />
            </Col>
          </Row>
        )}
        <Row>
          {isLoading ? (
            <Col span={24} className="text-center">
              <Spin />
            </Col>
          ) : (
            children
          )}
        </Row>
      </Row>
    );
  }
}

export default Card;
