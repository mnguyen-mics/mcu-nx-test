import * as React from 'react';
import { Row, Col, Spin } from 'antd';

export interface CardProps {
  buttons?: React.ReactNode;
  title?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: 'flex' | undefined;
  onClick?: () => void
}

class Card extends React.Component<CardProps> {
  render() {
    const { title, buttons, isLoading, children, className, style } = this.props;

    const hasHeader = title || buttons;

    
    const titleElement = title && (
        <span className="mcs-card-title">{title}</span>
      );
    
    const buttonsElement = buttons && (
      <span className="mcs-card-button">{buttons}</span>
    );

    return (
      <Row type={this.props.type} className={`mcs-card-container ${className ? className : ''}`} style={style ? style : {}}>
        {hasHeader && (
          <Row className="mcs-card-header">
            <Col span={24}>
              {titleElement}
              {buttonsElement}
            </Col>
          </Row>
        )}
        <Row type={this.props.type} style={this.props.type === 'flex' ? { flex: 1 } : {}}>
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
