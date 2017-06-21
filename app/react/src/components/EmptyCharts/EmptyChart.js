import React, { Component, PropTypes } from 'react';
import { Row, Col, Icon } from 'antd';

class EmptyCharts extends Component {

  render() {

    const {
      title,
      icon
    } = this.props;

    return (
      <Row className="mcs-card-no-data">
        <Col span={24} className="">
          <Icon type={icon} />
        </Col>
        <Col span={24} className="">
          {title}
        </Col>
      </Row>
    );
  }

}

EmptyCharts.defaultProps = {
  icon: 'exclamation-circle-o',
};

EmptyCharts.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
};

export default EmptyCharts;
