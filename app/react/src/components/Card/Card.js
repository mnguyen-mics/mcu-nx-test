import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

class Card extends Component {

  render() {

    const {
      title,
      buttons
    } = this.props;

    return (<Row className="mcs-card-container">
      { (title, buttons) && (<Row className="mcs-card-header">
        <Col span={24}>
          <span className="mcs-card-title">{title}</span><span className="mcs-card-button">{buttons}</span>
        </Col>
        <hr />
      </Row>) }
      <Row>
        <Col span={24}>
          {this.props.children}
        </Col>
      </Row>
    </Row>);
  }

}

Card.defaultProps = {
  buttons: null,
  title: null
};

Card.propTypes = {
  title: PropTypes.string,
  buttons: PropTypes.element,
};

export default Card;
