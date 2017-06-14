import React, { Component, PropTypes } from 'react';
import { Row, Col, Button } from 'antd';

class Card extends Component {

  render() {

    const {
      title,
      buttons
    } = this.props;

    return (
      <Row className="mcs-table-container">
        <Row className="mcs-table-header mcs-card-header">
          <Col span={24}>
            <span className="mcs-card-title">{title}</span><span className="mcs-card-button">{buttons}</span>
          </Col>
        </Row>
        <Row className="mcs-table-body">
          <Col span={24}>
            {this.props.children}
          </Col>
        </Row>
      </Row>
    );
  }

}

Card.defaultProps = {
  buttons: <span />
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  buttons: PropTypes.element,
};

export default Card;
