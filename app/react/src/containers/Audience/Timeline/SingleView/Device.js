import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Icon } from 'antd';

import McsIcons from '../../../../components/McsIcons';

const Device = (props) => {
  const {
    vectorId,
    device,
  } = props;

  const formFactorIcon = (f) => {
    switch (f) {
      case 'TABLET':
        return (<McsIcons type="tablet" />);
      case 'SMARTPHONE':
        return (<McsIcons type="smartphone" />);
      case 'PERSONAL_COMPUTER':
        return (<McsIcons type="laptop" />);
      default:
        return (<Icon type="question" />);

    }
  };
  return (device && vectorId) ? (
    <Row gutter={10} key={vectorId} className="table-line border-top">
      <Col className="table-left" span={12}>
        <span style={{ float: 'left' }}>{formFactorIcon(device.form_factor)}</span>
        <span style={{ float: 'left' }}><span className="title">{device.browser_family}</span><br /><span className="subtitle">{device.os_family}</span></span>
      </Col>
      <Col className="table-right" span={12}>
        <span style={{ float: 'right' }} className="subtitle">{vectorId}</span>
      </Col>
    </Row>
  ) : null;
};

Device.defaultProps = {
  vectorId: null,
  device: null,
};

Device.propTypes = {
  vectorId: PropTypes.string,
  device: PropTypes.shape({
    form_factor: PropTypes.string.isRequired,
    browser_family: PropTypes.string.isRequired,
    os_family: PropTypes.string.isRequired,
  }),
};

export default Device;
