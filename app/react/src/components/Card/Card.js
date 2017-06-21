import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

class Card extends Component {

  render() {

    const {
      title,
      buttons
    } = this.props;

    return (
      <Row className="mcs-card-container">
        <Row className="mcs-card-header">
          <Col span={24}>
            <span className="mcs-card-title">{title}</span><span className="mcs-card-button">{buttons}</span>
          </Col>
        </Row>
        <hr />
        <Row>
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
